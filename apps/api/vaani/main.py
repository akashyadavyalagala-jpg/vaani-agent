import base64
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional

from vaani.voices import VOICES, DEFAULT_VOICE, Voice
from vaani.sarvam import stt, llm, tts
from vaani.sarvam.client import SarvamAPIError
from vaani.agent.prompts import build_system_prompt
from vaani.agent.memory import get_memory
from vaani.ws.server import router as ws_router
from vaani.routes import router as console_router
from vaani.auth import router as auth_router
from vaani.telephony.ws_handler import router as twilio_ws_router

from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from prometheus_client import make_asgi_app, Histogram, Counter

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Vaani API", description="Telugu Voice AI Agent API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Prometheus Metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
vaani_latency_ms = Histogram('vaani_latency_ms', 'Latency of Vaani pipeline in ms')
vaani_error_rate = Counter('vaani_error_rate', 'Errors encountered during inference')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://vaani.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

app.include_router(ws_router)
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(console_router, prefix="/api/v1")
app.include_router(twilio_ws_router)

import os
os.makedirs("data/recordings", exist_ok=True)
app.mount("/recordings", StaticFiles(directory="data/recordings"), name="recordings")

@app.on_event("shutdown")
async def shutdown_event():
    # Triggered on graceful shutdown to close inflight connections and save metrics.
    pass

@app.exception_handler(SarvamAPIError)
async def sarvam_exception_handler(request: Request, exc: SarvamAPIError):
    vaani_error_rate.inc()
    return JSONResponse(
        status_code=502,
        content={"error": "Downstream AI Service Error", "detail": str(exc)},
    )

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/voices", response_model=List[Voice])
async def list_voices():
    return list(VOICES.values())

class ChatRequest(BaseModel):
    session_id: str
    text: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/stt")
@limiter.limit("60/minute")
async def process_stt(request: Request, audio: UploadFile = File(...)):
    if not audio.content_type:
        mime = "audio/wav"
    else:
        mime = audio.content_type
    audio_bytes = await audio.read()
    transcript = await stt.transcribe(audio_bytes, mime)
    return {"transcript": transcript}

@app.post("/chat", response_model=ChatResponse)
@limiter.limit("60/minute")
async def process_chat(request: Request, req: ChatRequest):
    memory = get_memory(req.session_id)
    memory.add_user_message(req.text)
    
    prompt = build_system_prompt()
    messages = memory.get_messages(prompt)
    
    reply = await llm.complete(messages)
    memory.add_agent_message(reply)
    
    return {"reply": reply}

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = DEFAULT_VOICE
    pace: Optional[float] = 1.0

@app.post("/tts")
@limiter.limit("60/minute")
async def process_tts(request: Request, req: TTSRequest):
    audio_bytes = await tts.synthesize(req.text, req.voice or DEFAULT_VOICE, req.pace or 1.0)
    return {"audio_base64": base64.b64encode(audio_bytes).decode("utf-8")}

@app.post("/turn")
@limiter.limit("60/minute")
async def turn(
    request: Request,
    session_id: str = Form(...),
    voice: str = Form(DEFAULT_VOICE),
    audio: UploadFile = File(...)
):
    # 1. STT
    audio_bytes = await audio.read()
    mime = audio.content_type or "audio/wav"
    transcript = await stt.transcribe(audio_bytes, mime)
    
    # 2. LLM
    memory = get_memory(session_id)
    memory.add_user_message(transcript)
    prompt = build_system_prompt()
    messages = memory.get_messages(prompt)
    
    reply = await llm.complete(messages)
    memory.add_agent_message(reply)
    
    # 3. TTS
    out_audio_bytes = await tts.synthesize(reply, voice, 1.0)
    
    return {
        "transcript": transcript,
        "reply": reply,
        "audio_base64": base64.b64encode(out_audio_bytes).decode("utf-8")
    }
