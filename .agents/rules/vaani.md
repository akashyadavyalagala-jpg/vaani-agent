---
description: "Core rules for developing the Vaani (వాణి) real-time Telugu voice AI agent."
---

# Vaani Workspace Rules

Every agent session must obey the following constitution to maintain the premium quality and architectural integrity of Vaani.

## 1. Coding Standards & Folder Layout
- **Monorepo:** `apps/web` (Next.js 15), `apps/api` (FastAPI), `packages/shared` (types).
- **Naming:** Use `camelCase` for variables and TS files, `PascalCase` for React components, and `snake_case` for Python files and database columns.
- **Commit Style:** Use Conventional Commits (e.g., `feat(api): add sarvam stt integration`).

## 2. Secrets & Configurations
- **Secrets ONLY via `.env`:** Never hardcode API keys or database URLs. All secrets must be injected via environment variables.

## 3. Content Integrity
- **No Placeholder Content:** NEVER use "Lorem Ipsum" or generic placeholder content. Design with real Telugu scenarios (e.g., appointment booking intents).
- **Telugu Strings:** All Telugu text and user-facing strings MUST live in localization/i18n files. Never hardcode Telugu strings directly in React components.

## 4. Visual Quality Assurance
- **Verification:** Every UI change MUST be verified using the browser subagent, capturing a screenshot to ensure the "Premium Dark AI" aesthetic is maintained.

## 5. Session Handoff
- **Walkthrough Artifact:** Every agent session or development phase MUST end by generating or updating a `Walkthrough` artifact, summarizing decisions made, tasks completed, and open questions for the human.
