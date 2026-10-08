import asyncio
import websockets
import json

async def test():
    try:
        async with websockets.connect('ws://127.0.0.1:8000/ws/session') as ws:
            print("Connected!")
            await ws.send(json.dumps({"type":"session.start"}))
            print("Received:", await ws.recv())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
