from pydantic import BaseModel, Field
from typing import Literal, Union, Dict, Optional

# --- Client Events ---

class ClientSessionStart(BaseModel):
    type: Literal["session.start"] = "session.start"
    voice: Optional[str] = None
    pace: Optional[float] = None
    agent_id: Optional[str] = None
    locale: Optional[str] = None

class ClientAudioChunk(BaseModel):
    type: Literal["audio.chunk"] = "audio.chunk"
    seq: int
    payload: str

class ClientAudioEnd(BaseModel):
    type: Literal["audio.end"] = "audio.end"

class ClientInterrupt(BaseModel):
    type: Literal["interrupt"] = "interrupt"

class ClientSessionEnd(BaseModel):
    type: Literal["session.end"] = "session.end"

class ClientTextInput(BaseModel):
    type: Literal["text.input"] = "text.input"
    text: str

ClientMessage = Union[
    ClientSessionStart,
    ClientAudioChunk,
    ClientAudioEnd,
    ClientInterrupt,
    ClientSessionEnd,
    ClientTextInput
]

# --- Server Events ---

class ServerSessionReady(BaseModel):
    type: Literal["session.ready"] = "session.ready"
    session_id: str

class ServerVadSpeechStart(BaseModel):
    type: Literal["vad.speech_start"] = "vad.speech_start"

class ServerSttPartial(BaseModel):
    type: Literal["stt.partial"] = "stt.partial"
    text: str

class ServerSttFinal(BaseModel):
    type: Literal["stt.final"] = "stt.final"
    text: str
    language: str

class ServerLlmDelta(BaseModel):
    type: Literal["llm.delta"] = "llm.delta"
    text: str

class ServerAgentState(BaseModel):
    type: Literal["agent.state"] = "agent.state"
    state: Literal["LISTENING", "TRANSCRIBING", "THINKING", "SPEAKING", "IDLE"]

class ServerTtsChunk(BaseModel):
    type: Literal["tts.chunk"] = "tts.chunk"
    seq: int
    sentence_id: int
    wav_b64: str

class ServerTtsEnd(BaseModel):
    type: Literal["tts.end"] = "tts.end"

class ServerMetrics(BaseModel):
    type: Literal["metrics"] = "metrics"
    timings: Dict[str, float]

class ServerError(BaseModel):
    type: Literal["error"] = "error"
    code: str
    message: str
    retryable: bool

ServerMessage = Union[
    ServerSessionReady,
    ServerVadSpeechStart,
    ServerSttPartial,
    ServerSttFinal,
    ServerLlmDelta,
    ServerAgentState,
    ServerTtsChunk,
    ServerTtsEnd,
    ServerMetrics,
    ServerError
]
