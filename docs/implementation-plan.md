# Vaani Implementation Plan

## Phase 1: Bug Fixes & Stabilization (Step 1)
**Goal:** Root cause, fix, and add regression tests for Bugs 1-5 to guarantee a flawless core conversation loop.

*   **Bug 1: Theme toggle does nothing.**
    *   *Action:* Fix hydration mismatches, ensure `data-theme` is applied correctly at the DOM root, and persist the theme setting locally (with `next-themes` or equivalent). Guarantee all transitions (especially the VoiceOrb) respect the applied theme seamlessly.
*   **Bug 2: Agent never replies.**
    *   *Action:* *Already mostly mitigated (empty system prompt fixed), but requires adding end-to-end trace logging, timeout handlers, and bilingual UI error boundaries.* If STT/LLM/TTS drops, the UI will proactively inform the user with a retry button instead of dead silence.
*   **Bug 3: Only first spoken sentence is recorded.**
    *   *Action:* Fix VAD state machine (`isSpeakingRef`) to properly re-arm after `agent.tts.end`. Ensure partial and final transcripts are continuously appended to the `messages` state instead of overwriting. Create Playwright fixtures for 10-turn testing.
*   **Bug 4: End call goes to onboarding & refresh wipes state.**
    *   *Action:* Add a proper tear-down sequence that redirects the user to `/talk/summary/[id]` (mocked until Phase 2). Extract in-memory state out of closures.
*   **Bug 5: Header logo behavior.**
    *   *Action:* Update logo typography (Telugu "వాణి" variant), gradient hover state, and `href` behaviors. Implement the active-call interruption warning dialog ("Call is still active. Leave?").

## Phase 2: Persistence & Accounts (Step 2)
**Goal:** Transform the app from memory-only to a full-stack persistent product.

*   **Backend Changes:**
    *   Implement SQLModel definitions for `User`, `Session`, `Conversation`, `Message`, and `Settings`.
    *   Setup Alembic and run initial migrations.
    *   Implement Argon2id auth routes (`/api/auth/login`, `/api/auth/guest`).
    *   Update `orchestrator.py` to write-through messages to the database immediately upon finalization.
*   **Frontend Changes:**
    *   URL-driven sessions: `/talk/[conversationId]`.
    *   Add IndexedDB fallback wrapper for offline message queuing.
    *   Build the Post-call Summary Page.

## Phase 3: Routing & Dashboards (Step 3)
**Goal:** Build out the full UI structure and navigation.

*   **Public Routes:** Home landing page `/` (hero, CTA), Auth screens (`/login`, `/signup`).
*   **Protected App Shell:** `/app` dashboard layout with a persistent sidebar or top-nav, Command Palette (`⌘K`), and Breadcrumbs.
*   **Dashboard Features:** Animated sparklines, recent calls, latency tracking, completion rates.
*   **Conversation Detail View:** Full timeline, latency waterfall, audio playback, entity extraction panel.
*   **Agent Studio:** Form UI to edit Persona, Business hours, Voice picker, FAQs.

## Phase 4: "God-Level" Features (Step 4)
**Goal:** Ship standout capabilities grouped by Tiers.

*   **Tier A (Conversation Magic):** Live "thinking" step ticker, Smart interruption/fillers (Barge-in), Message feedback loops (replay/copy), Context-aware chips, and Auto-language detection.
*   **Tier B (Product Depth):** Emotion/sentiment timelines, Vector search over past calls, Voice Lab (compare 7 voices), Realtime PiP captions, Webhooks configuration.
*   **Tier C (Polish):** Command palette NLP, Onboarding tours, PWA support + Wake Lock, Accessibility themes (High Contrast/Dyslexia).

## Phase 5 & 6: Performance & Hardening
*   **No-Lag Guarantee:** Profile CPU under 4x throttling. Optimize React re-renders to ensure `requestAnimationFrame` loop remains rock solid at 60fps. Avoid CSS filters on the WebGL canvas.
*   **Bug-Hunt Loop:** Aggressive adversarial testing via Playwright and browser subagent (session expiry, network drops, rapid clicking).

---
**Approval Request:** Do you approve this Implementation Plan? Once approved, I will begin executing **Phase 1 (Bugs 1-5)**, generating `docs/bug-fix-report.md` for each fixed bug with evidence as requested.
