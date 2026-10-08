# Deployment Guide

Vaani is built to scale independently across its frontend and backend components. We recommend deploying the Next.js web application to Vercel and the FastAPI backend to an infrastructure capable of persistent WebSockets (like Render, Fly.io, or Google Cloud Run with WebSockets enabled).

## Environment Matrix

### 1. Local Development (`dev`)
Use `docker-compose.yml` for local development. This provisions Postgres, the FastAPI backend, and the Next.js frontend in watch-mode.
```bash
docker-compose up --build
```

### 2. Staging (`staging`)
Staging environments mirror production but use smaller resource classes.
- Web: Vercel Preview Deployments.
- API: Render Web Service (Free/Starter tier).
- DB: Render Managed Postgres.

### 3. Production (`prod`)

#### Deploying the Web App (Vercel)
1. Import the repository into Vercel.
2. Set the `Build Command` to `pnpm run build` and `Install Command` to `pnpm install`.
3. Set the `NEXT_PUBLIC_API_URL` environment variable to your production API URL (e.g., `https://api.vaani.com`).
4. Deploy. Vercel automatically handles SSL, Edge Caching, and CDN distributions.

#### Deploying the API (Fly.io)
Fly.io natively supports long-lived WebSockets and global load balancing.

1. Install `flyctl` and run `fly launch`.
2. Select the `apps/api/Dockerfile`.
3. Set your secrets:
   ```bash
   fly secrets set SARVAM_API_KEY="your-key"
   fly secrets set DATABASE_URL="postgres://user:pass@host/vaani"
   ```
4. Deploy the application: `fly deploy`.

#### Zero-Downtime Deployments & Rollbacks
- **Web (Vercel)**: Atomic deployments natively guarantee zero downtime. Rollbacks are performed via Vercel's "Instant Rollback" button.
- **API (Fly.io/Render)**: Configured with Health Checks (see `Dockerfile`). The load balancer will not route traffic to the new instances until `/health` returns 200 OK. If a deployment fails, it automatically rolls back.

#### Scaling & State Management
Currently, the TurnManager manages conversational state in-memory. If you scale beyond one instance, you MUST implement Redis session fan-out (Sticky Sessions) to ensure that a WebSocket connection and its associated background tasks reach the same instance, or that conversational state is pushed to Redis.
