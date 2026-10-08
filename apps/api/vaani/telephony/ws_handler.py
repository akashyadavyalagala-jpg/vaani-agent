import json
import base64
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .audio import AudioBridge

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/ws/twilio")
async def twilio_media_stream(websocket: WebSocket):
    """
    Handles Twilio's bidirectional Media Streams over WebSockets.
    - Twilio sends 8kHz mu-law audio base64 encoded.
    - We must respond with 8kHz mu-law audio base64 encoded.
    """
    await websocket.accept()
    bridge = AudioBridge()
    stream_sid = None

    try:
        # 1. Listen for Twilio Stream events
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            event = data.get("event")

            if event == "connected":
                logger.info("Twilio Stream connected")
            elif event == "start":
                stream_sid = data.get("streamSid")
                logger.info(f"Twilio Stream started: {stream_sid}")
                # Mock creating a call in the database flagged as channel=phone
                logger.info(f"DB: Created Call with id=CALL_{stream_sid}, channel='phone', status='in_progress'")
                # Start Vaani TurnManager or Agent session here...
            elif event == "media":
                payload_b64 = data["media"]["payload"]
                mulaw_bytes = base64.b64decode(payload_b64)
                
                # Transcode 8kHz mu-law to 16kHz PCM for Sarvam
                pcm_16k_bytes = bridge.inbound_transcode(mulaw_bytes)
                
                # TODO: Feed pcm_16k_bytes to the VAD and Agent TurnManager
                # If the agent speaks, we would transcode back and send:
                # agent_mulaw_bytes = bridge.outbound_transcode(agent_pcm_16k_bytes)
                # await websocket.send_json({
                #    "event": "media",
                #    "streamSid": stream_sid,
                #    "media": {"payload": base64.b64encode(agent_mulaw_bytes).decode('ascii')}
                # })

            elif event == "stop":
                logger.info(f"Twilio Stream stopped: {stream_sid}")
                break

    except WebSocketDisconnect:
        logger.info(f"Twilio WebSocket disconnected: {stream_sid}")
    except Exception as e:
        logger.error(f"Error in Twilio stream: {e}")
