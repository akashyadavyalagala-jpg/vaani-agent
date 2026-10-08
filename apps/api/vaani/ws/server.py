import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from vaani.ws.protocol import ClientSessionStart, ServerSessionReady
from vaani.ws.orchestrator import Orchestrator

router = APIRouter()

@router.websocket("/ws/session")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    async def send_msg(msg):
        await websocket.send_text(msg.model_dump_json())
        
    orchestrator = None
    
    try:
        while True:
            data = await websocket.receive_text()
            event = json.loads(data)
            
            if event.get("type") == "session.start":
                session_id = event.get("session_id")
                if not session_id:
                    session_id = "session_" + str(id(websocket))
                orchestrator = Orchestrator(session_id, send_msg)
                await send_msg(ServerSessionReady(session_id=session_id))
            
            elif orchestrator:
                if event.get("type") == "audio.chunk":
                    await orchestrator.handle_audio(event.get("payload", ""))
                elif event.get("type") == "audio.end":
                    await orchestrator.handle_audio_end()
                elif event.get("type") == "interrupt":
                    await orchestrator.interrupt()
                elif event.get("type") == "text.input":
                    await orchestrator.handle_text(event.get("text", ""))
    except WebSocketDisconnect:
        if orchestrator and not orchestrator.session_id.startswith("session_"):
            from vaani.database import AsyncSessionLocal
            from vaani.models import Call, CallStatus
            import datetime
            try:
                async with AsyncSessionLocal() as session:
                    call = await session.get(Call, orchestrator.session_id)
                    if call:
                        call.status = CallStatus.COMPLETED
                        call.completed_at = datetime.datetime.utcnow()
                        call.duration_sec = int((call.completed_at - call.started_at).total_seconds())
                        await session.commit()
            except Exception as e:
                print(f"Error saving Call Status: {e}")
    except Exception as e:
        print(f"WS Error: {e}")
