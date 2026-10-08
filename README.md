# Vaani - Telugu Voice AI Agent

Vaani is a production-grade, real-time voice AI agent tailored for Telugu. It features ultra-low latency conversational AI using Sarvam APIs, strict regulatory compliance for Indian telephony, and a beautifully designed dashboard console.

## 🚀 60-Second Quickstart

**Requirements**: Docker, Node 20, Python 3.11+

1. **Clone & Env**:
   ```bash
   git clone https://github.com/yourorg/tel_voc_agent.git
   cd tel_voc_agent
   cp apps/api/.env.example apps/api/.env # Add your SARVAM_API_KEY
   ```

2. **Run via Docker**:
   ```bash
   docker-compose up --build
   ```

3. **Experience the Magic**:
   Open `http://localhost:3000` to access the dashboard and `http://localhost:3000/talk` to converse with the agent.

## 🏗 Architecture

Vaani is a monorepo consisting of:
- **`apps/web`**: Next.js (App Router), Tailwind CSS v4, Server Components.
- **`apps/api`**: FastAPI Python backend, managing the WebSocket Turn Orchestrator, Sarvam AI integrations, Twilio Telephony adapters, and Postgres DB.
- **`docker-compose.yml`**: Full-stack orchestrator.

## ⚙️ .env Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SARVAM_API_KEY` | Your Sarvam AI API Key | Yes | - |
| `DATABASE_URL` | PostgreSQL Connection String | Yes | sqlite:///./vaani.db |
| `NEXT_PUBLIC_API_URL` | API Endpoint for the Web App | Yes | http://localhost:8000 |

## 📚 Guides

### Add a New Voice
1. Open `apps/api/vaani/voices.py`.
2. Add a new `Voice` object to the `VOICES` dictionary (e.g., `"arun": Voice(id="arun", name="Arun", language="te-IN", gender="male")`).
3. The UI will automatically populate the new option.

### Add a New Language
1. Add the language code to `apps/web/package.json` translations if using i18n, and to the Sarvam prompts in `apps/api/vaani/agent/prompts.py`.
2. Ensure you have the localized fonts loaded in `next.config.ts`.

### Add a New Tool
1. Register the schema in `apps/api/vaani/agent/prompts.py` within the `TOOL PROTOCOL` XML block.
2. Implement the parsing and execution logic in `apps/api/vaani/ws/orchestrator.py` during the `THINKING` phase.

## 🩺 Troubleshooting

- **Microphone Permission Denied**: Check browser site settings. Ensure you are accessing via `localhost` or `https://` (WebRTC fails on insecure origins).
- **Echo over Bluetooth**: The web client uses `echoCancellation: true` by default. If using Bluetooth, the OS might switch profiles. Refresh the page after connecting headphones.
- **Latency Spikes**: The system is tuned for <1.5s p50. If you experience >3s latency, check the Prometheus metrics at `http://localhost:8000/metrics`.

## 🚨 On-Call Runbook

- **Symptom: High `vaani_error_rate`**
  - **Action**: Check `docker logs tel_voc_agent-api-1`. If `SarvamAPIError` is logged, verify your Sarvam Quota limits.
- **Symptom: Database Connection Refused**
  - **Action**: Check if Postgres container is healthy: `docker ps`. Restart the database: `docker-compose restart db`.

## 🤝 Contribution
Please ensure you run `make lint` and `make test` before submitting PRs. Review our `docs/audit-report.md` for our security posture.
