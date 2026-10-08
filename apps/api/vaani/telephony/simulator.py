import asyncio
import websockets
import json
import base64
import wave
import audioop

async def simulate_call(ws_url: str = "ws://127.0.0.1:8000/ws/twilio"):
    """
    Simulates a Twilio incoming call by connecting to the WebSocket,
    sending a 'start' event, and then streaming dummy mu-law audio.
    """
    async with websockets.connect(ws_url) as ws:
        print("Connected to WebSocket simulator")

        # 1. Send Connected
        await ws.send(json.dumps({"event": "connected", "protocol": "Call", "version": "1.0.0"}))
        
        # 2. Send Start
        start_payload = {
            "event": "start",
            "sequenceNumber": "1",
            "start": {
                "streamSid": "MZ_SIMULATOR_123",
                "accountSid": "AC_SIMULATOR",
                "callSid": "CA_SIMULATOR",
                "tracks": ["inbound"],
                "mediaFormat": {"encoding": "audio/x-mulaw", "sampleRate": 8000, "channels": 1}
            },
            "streamSid": "MZ_SIMULATOR_123"
        }
        await ws.send(json.dumps(start_payload))
        print("Sent 'start' event")

        # 3. Send Media Stream (Dummy silence or a tiny wav for now)
        # We'll just generate 50 frames of silence (8kHz mu-law silence byte is 0xFF)
        silence_mulaw = b'\xff' * 160  # 160 bytes = 20ms at 8kHz
        
        for i in range(2, 50):
            media_payload = {
                "event": "media",
                "sequenceNumber": str(i),
                "media": {
                    "track": "inbound",
                    "chunk": str(i),
                    "timestamp": str(i * 20),
                    "payload": base64.b64encode(silence_mulaw).decode('ascii')
                },
                "streamSid": "MZ_SIMULATOR_123"
            }
            await ws.send(json.dumps(media_payload))
            await asyncio.sleep(0.02) # 20ms pacing

        # 4. Stop
        await ws.send(json.dumps({"event": "stop", "streamSid": "MZ_SIMULATOR_123"}))
        print("Simulator finished streaming")

if __name__ == "__main__":
    asyncio.run(simulate_call())
