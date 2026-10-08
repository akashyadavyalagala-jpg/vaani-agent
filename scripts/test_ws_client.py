import asyncio
import websockets
import json
import base64
import time

async def test_ws_client():
    uri = "ws://127.0.0.1:8000/ws/session"
    async with websockets.connect(uri) as websocket:
        # Start session
        await websocket.send(json.dumps({"type": "session.start", "voice": "kavitha", "pace": 1.0}))
        msg = await websocket.recv()
        print(f"Server: {msg}")
        
        # Send audio chunk
        await websocket.send(json.dumps({"type": "audio.chunk", "seq": 1, "payload": "ZmFrZV9hdWRpbw=="}))
        await websocket.send(json.dumps({"type": "audio.end"}))
        
        t0 = time.time()
        chunks_received = 0
        interrupt_sent = False
        
        try:
            while True:
                msg = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                event = json.loads(msg)
                print(f"[{time.time() - t0:.2f}s] Event: {event['type']}")
                
                if event['type'] == 'tts.chunk':
                    chunks_received += 1
                    # Test Interrupt mid-speech
                    if chunks_received == 1 and not interrupt_sent:
                        print("Sending Interrupt...")
                        await websocket.send(json.dumps({"type": "interrupt"}))
                        interrupt_sent = True
                        
                elif event['type'] == 'metrics':
                    print(f"Metrics: {event['timings']}")
                elif event['type'] == 'tts.end':
                    break
                elif event['type'] == 'agent.state' and event['state'] == 'LISTENING' and interrupt_sent:
                    print("Interrupt successful, agent back to LISTENING.")
                    break
        except asyncio.TimeoutError:
            print("Timed out waiting for server.")

if __name__ == "__main__":
    asyncio.run(test_ws_client())
