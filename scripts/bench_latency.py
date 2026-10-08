import asyncio
import json
import websockets
import time
from tabulate import tabulate

async def run_benchmark(num_runs: int = 5):
    uri = "ws://127.0.0.1:8000/ws/session"
    results = []

    for i in range(num_runs):
        async with websockets.connect(uri) as websocket:
            await websocket.send(json.dumps({"type": "session.start", "voice": "kavitha", "pace": 1.0}))
            await websocket.recv() # session.ready
            
            # Send dummy audio
            await websocket.send(json.dumps({"type": "audio.chunk", "seq": 1, "payload": "ZmFrZV9hdWRpbw=="}))
            await websocket.send(json.dumps({"type": "audio.end"}))
            
            while True:
                try:
                    msg = await asyncio.wait_for(websocket.recv(), timeout=15.0)
                    event = json.loads(msg)
                    if event['type'] == 'metrics':
                        results.append(event['timings'])
                        break
                    elif event['type'] == 'tts.end':
                        pass
                except asyncio.TimeoutError:
                    print(f"Run {i+1} timed out.")
                    break

    if not results:
        print("No results collected.")
        return

    # Calculate p50 and p95
    import statistics
    keys = results[0].keys()
    table = []
    
    for key in keys:
        values = [r[key] for r in results]
        values.sort()
        p50 = statistics.median(values)
        p95 = values[int(len(values) * 0.95)] if len(values) >= 20 else max(values)
        table.append([key, f"{p50:.2f} ms", f"{p95:.2f} ms"])

    print("\n=== Latency Benchmark ===")
    print(tabulate(table, headers=["Metric", "p50", "p95"], tablefmt="github"))

if __name__ == "__main__":
    asyncio.run(run_benchmark())
