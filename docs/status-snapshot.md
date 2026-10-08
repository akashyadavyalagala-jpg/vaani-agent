# Status Snapshot

**Timestamp**: 2026-10-03
**Environment**: Local (Windows)

## 1. Apps Overview
- `apps/api/`: FastAPI application. Contains endpoints, Sarvam API integration (`stt.py`, `llm.py`, `tts.py`), a WebSockets orchestrator (`ws/`), and an in-memory session store (`memory.py`). Includes a local `vaani.db` (SQLite).
- `apps/web/`: Next.js 16.3.8 web application. Contains `src/hooks/useVoiceAgent.ts` which manages the WebSocket connection, and `src/components/talk/` containing the UI components (VoiceOrb, Drawer, ControlDock, etc.).

## 2. Execution Status
- **Backend**: Currently running via Uvicorn on `0.0.0.0:8000` (task-1693) and is healthy.
- **Frontend**: Currently running via Next.js `pnpm run dev` on `localhost:3000` (task-1733).
- **Transport Mechanism**: The UI is using **WebSocketTransport**, which connects to the backend via Next.js proxy rewrites (`/ws/session`) to circumvent browser CSP/CORS limitations.
- **API Keys**: `SARVAM_API_KEY` is confirmed to be set in `apps/api/.env`.

## 3. Architecture Phase Implementation Status
(Based on `docs/03-architecture.md`)
- **Phase 1: Basic Audio/WebSocket Flow**: **Implemented**. MediaRecorder streams WebM over WebSockets, Backend transcodes and buffers.
- **Phase 2: Sarvam Pipeline**: **Implemented**. STT (saaras:v3) -> LLM (sarvam-105b) -> TTS (bulbul:v3) flow is active.
- **Phase 3: Database & Persistence**: **Only Planned**. Currently, `ConversationMemory` stores data in memory (`_sessions` dict in `memory.py`), and any page refresh wipes the frontend context. `SQLModel` and `Alembic` migrations have not been wired to the realtime loop.
- **Phase 4: Authentication & Dashboards**: **Only Planned**. Routes like `/login`, `/app` do not exist or are fully mocked.
- **Phase 5: Tools & Actions (Booking)**: **Only Planned**. The LLM prompt defines `<tool_call>` protocol, but there is no tool-execution engine parsing it or executing bookings.
