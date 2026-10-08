import asyncio
import time
from vaani.ws.protocol import ServerMessage, ServerAgentState, ServerMetrics
from vaani.agent.memory import get_memory
from vaani.sarvam import stt, llm, tts
from vaani.agent.chunker import SentenceChunker
from vaani.agent.normalize import normalize_telugu

class Orchestrator:
    def __init__(self, session_id: str, send_cb):
        self.session_id = session_id
        self.send = send_cb
        self.state = "IDLE"
        self.memory = get_memory(session_id)
        
        self._current_task = None
        self._audio_buffer = bytearray()
        self._is_speaking = False

    async def change_state(self, new_state: str):
        self.state = new_state
        await self.send(ServerAgentState(state=new_state))

    async def handle_audio(self, payload: str):
        if self.state in ["SPEAKING", "THINKING"]:
            await self.interrupt()
        
        if self.state == "IDLE":
            await self.change_state("LISTENING")
            
        import base64
        chunk_bytes = base64.b64decode(payload)
        self._audio_buffer.extend(chunk_bytes)

    async def handle_audio_end(self):
        if self.state == "LISTENING" and len(self._audio_buffer) > 0:
            self._current_task = asyncio.create_task(self.process_turn())

    async def interrupt(self):
        if self._current_task and not self._current_task.done():
            self._current_task.cancel()
        await self.change_state("LISTENING")
        from vaani.ws.protocol import ServerError
        self._audio_buffer.clear()

    async def handle_text(self, text: str):
        if self.state in ["SPEAKING", "THINKING"]:
            await self.interrupt()
        self._current_task = asyncio.create_task(self.process_turn(override_text=text))

    async def process_turn(self, override_text: str = None):
        metrics = {}
        t0 = time.time()
        try:
            await self.change_state("TRANSCRIBING")
            
            audio_data = bytes(self._audio_buffer)
            self._audio_buffer.clear()
            
            if override_text:
                transcript = override_text
                metrics["stt_ms"] = 0
            else:
                # Run STT
                transcript = await stt.transcribe(audio_data, "audio/webm")
                metrics["stt_ms"] = (time.time() - t0) * 1000
            
            if not transcript or not transcript.strip():
                await self.change_state("LISTENING")
                return

            from vaani.ws.protocol import ServerSttFinal
            await self.send(ServerSttFinal(text=transcript, language="te"))
            
            await self.change_state("THINKING")
            self.memory.add_user_message(transcript.strip())
            
            # Start LLM stream
            from vaani.agent.prompts import build_system_prompt
            prompt = build_system_prompt()
            messages = self.memory.get_messages(prompt)
            token_stream = llm.stream(messages)
            
            await self.change_state("SPEAKING")
            t_ttft = None
            seq = 0
            
            full_reply = ""
            agent_audio_buffer = bytearray()
            total_audio_duration = 0.0
            t_speaking_start = time.time()
            
            async for chunk in token_stream:
                if t_ttft is None:
                    t_ttft = time.time()
                    metrics["llm_ttft_ms"] = (t_ttft - t0) * 1000
                
                full_reply += chunk
                
                from vaani.ws.protocol import ServerLlmDelta
                await self.send(ServerLlmDelta(text=chunk))
                
            # Now synthesize the full reply for completely smooth audio without breaks
            if full_reply.strip():
                from vaani.agent.normalize import normalize_telugu
                clean_reply = normalize_telugu(full_reply)
                audio_bytes = await tts.synthesize(clean_reply, "kavitha", 1.0)
                agent_audio_buffer.extend(audio_bytes)
                
                from vaani.utils.audio import get_wav_duration
                total_audio_duration = get_wav_duration(audio_bytes)
                
                metrics["tts_first_chunk_ms"] = (time.time() - t0) * 1000
                metrics["e2e_first_audio_ms"] = metrics["tts_first_chunk_ms"]
                
                from vaani.ws.protocol import ServerTtsChunk
                import base64
                b64 = base64.b64encode(audio_bytes).decode('utf-8')
                await self.send(ServerTtsChunk(seq=0, sentence_id=0, wav_b64=b64))
                t_speaking_start = time.time()
                
            self.memory.add_agent_message(full_reply.strip())
            metrics["llm_total_ms"] = (time.time() - t0) * 1000
            
            # Save User Audio
            import os
            import uuid
            user_turn_id = str(uuid.uuid4())
            user_audio_url = None
            if audio_data:
                user_audio_path = f"data/recordings/{user_turn_id}_user.webm"
                with open(user_audio_path, "wb") as f:
                    f.write(audio_data)
                user_audio_url = f"/recordings/{user_turn_id}_user.webm"

            # Save Agent Audio (concatenate all TTS chunks for this turn)
            agent_audio_url = None
            agent_turn_id = str(uuid.uuid4())
            if agent_audio_buffer:
                agent_audio_path = f"data/recordings/{agent_turn_id}_agent.wav"
                with open(agent_audio_path, "wb") as f:
                    f.write(agent_audio_buffer)
                agent_audio_url = f"/recordings/{agent_turn_id}_agent.wav"
            
            # Save User Turn
            await self.save_turn(
                turn_id=user_turn_id,
                role="user", 
                text=transcript,
                audio_url=user_audio_url
            )
            # Save Agent Turn
            await self.save_turn(
                turn_id=agent_turn_id,
                role="agent", 
                text=full_reply.strip(),
                metrics=metrics,
                audio_url=agent_audio_url
            )
            
            from vaani.ws.protocol import ServerTtsEnd
            await self.send(ServerTtsEnd())
            await self.send(ServerMetrics(timings=metrics))
            
            # Wait for audio to finish playing on frontend
            elapsed_time = time.time() - t_speaking_start
            sleep_time = total_audio_duration - elapsed_time
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
                
            await self.change_state("LISTENING")
            
        except asyncio.CancelledError:
            # Handle interrupt
            pass
        except Exception as e:
            print(f"Error in process_turn: {e}")
            import traceback
            traceback.print_exc()
            from vaani.ws.protocol import ServerError
            await self.send(ServerError(message="AI service encountered an error. Please try again."))
            await self.change_state("ERROR")

    async def save_turn(self, turn_id: str, role: str, text: str, metrics: dict = None, audio_url: str = None):
        import datetime
        from vaani.database import AsyncSessionLocal
        from vaani.models import Turn
        try:
            async with AsyncSessionLocal() as session:
                t = Turn(
                    id=turn_id,
                    call_id=self.session_id,
                    role=role,
                    text=text,
                    audio_url=audio_url,
                    latency_vad_ms=metrics.get("vad_ms") if metrics else None,
                    latency_llm_ms=metrics.get("llm_ttft_ms") if metrics else None,
                    latency_tts_ms=metrics.get("tts_first_chunk_ms") if metrics else None,
                    created_at=datetime.datetime.utcnow()
                )
                session.add(t)
                await session.commit()
        except Exception as e:
            print(f"Failed to save turn to DB: {e}")
