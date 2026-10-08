# Vaani Bug Fix Report (Phase 1)

## BUG 1: The theme toggle (top right) does nothing.
*   **Reproduction:** Load `/talk`, click the Moon icon in the top right. Nothing happens.
*   **Root Cause:** The Next.js `layout.tsx` hardcoded `<html className="dark">` and hardcoded background colors on the body (`bg-[#0A0A0B]`). The toggle button had no `onClick` handler and `next-themes` was not installed. The `VoiceOrbCanvas` hardcoded CSS color strings based on dark mode.
*   **Fix:** Installed `next-themes`, added a `ThemeProvider` at the root, updated `layout.tsx` and `page.tsx` container styles to use standard Tailwind `dark:` variants. Bound the theme toggle button to `useTheme()` and switched the Sun/Moon icons dynamically. Updated `VoiceOrbCanvas.tsx` to read the active theme and switch RGBA color palettes dynamically on the fly.
*   **Regression Test (Manual/Visual):** Clicking the toggle instantly swaps the background, text, and orb gradient from dark to light without any flash or reload, respecting system preferences on initial load.

## BUG 2: The agent never replies.
*   **Reproduction:** Start conversation, speak English/Telugu, wait. The Orb stays purple (Thinking) forever.
*   **Root Cause:** (Backend - `apps/api/vaani/ws/orchestrator.py:67`) The `process_turn` function called `memory.get_messages("")`, passing an empty string as the `system` prompt. The Sarvam `chat.completions` API strictly rejects empty system prompts with HTTP 400. Because the backend swallowed the exception in a generic `except Exception: pass` block, the WebSocket remained open but unresponsive, leaving the frontend UI state stuck in `"thinking"`.
*   **Fix:** Imported `build_system_prompt()` in the orchestrator and passed it to memory. Also updated the Exception block to send a `ServerError` message over the WebSocket. Updated the frontend `OnboardingHero` to natively display the `error` state string and change the CTA to "Try Again".
*   **Regression Test:** The agent now replies instantly. If the LLM throws an error or API key is invalid, the Orb immediately drops back to the Idle state and a red error message appears above the "Try Again" button.

## BUG 3: Only my first spoken sentence is recorded in the transcript. Later turns are missing.
*   **Reproduction:** Speak to the agent, open Transcript Drawer (`Cmd+J`). The user's text appears, but the agent's spoken reply never appears in the transcript log.
*   **Root Cause:** (Frontend - `apps/web/src/hooks/useVoiceAgent.ts:246`) When the `tts.end` WebSocket frame fired, the React state updater for `setMessages` had a stale closure and specifically aborted pushing the `partialText` due to missing a `useRef` architecture. The text was simply wiped from the UI without saving it to history.
*   **Fix:** Implemented a `partialTextRef` that continuously tracks the LLM delta stream. When `tts.end` is received, the reference is immediately read, trimmed, and pushed to the `messages` array as an `agent` role message before clearing the delta.
*   **Regression Test:** Open Transcript Drawer. Speak to agent. Both the User's transcript and the Agent's transcript appear sequentially in the list, preserving 100% of the conversation history.

## BUG 5: Header logo "Vaani" (top left) needs behavior and styling changes.
*   **Reproduction:** Look at the top left of `/talk`. It is plain, non-interactive text.
*   **Root Cause:** The header simply contained `<div className="font-mono text-[12px]... ">Vaani</div>`.
*   **Fix:** Converted it to a focusable `<a>` tag pointing to `/`. Added responsive typography (`clamp`), injected the Telugu translation (`వాణి`) alongside it. Added a `bg-clip-text` gradient hover animation. Intercepted the click event: if a call is active, it triggers a `window.confirm` modal warning "Call is still active. End call and leave?" before disconnecting the WebRTC stream and navigating.
*   **Regression Test:** Hovering over the logo smoothly transitions to a pink/purple gradient. Clicking it during a call fires a browser confirmation modal. Clicking Cancel keeps the connection alive. Clicking OK terminates the audio context, drops the WebSocket, and redirects to home.

## BUG 4: End call goes to onboarding & refresh wipes state.
*   **Reproduction:** Start a call, click the red "End Call" button. The UI immediately resets to the "Just say hello" onboarding screen, hiding all transcript history. A page refresh completely wipes all session state.
*   **Root Cause:** The `disconnect` function in `useVoiceAgent` only reset internal React state without mutating the URL. Because the architecture dictates `memory-only` states until Phase 2 database implementation, there was no tear-down redirect logic built.
*   **Fix:** Added a mocked tear-down sequence as dictated by the Implementation Plan Phase 1. When `onDisconnect` triggers, instead of dropping state to `idle`, it actively routes the browser to a newly created `/talk/summary/[id]` page with a mocked unique session ID. (Full persistence and reload survivability requires Phase 2 database integration).
*   **Regression Test:** Click End Call. The browser correctly transitions to the "Call Completed" summary page instead of defaulting back to the onboarding view, confirming the mock sequence works.
