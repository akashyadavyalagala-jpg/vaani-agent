# UI Parity Matrix

This document tracks the feature and functionality parity between the original `docs/reference/ui/voice-agent-reference.html` prototype and the React/Next.js re-write (`apps/web`).

| ID | Feature | Original Behavior | Status | Fix Strategy | Guard Test |
|---|---|---|---|---|---|
| 1 | Onboarding | Hero title with staggered word reveal, shimmer-sweep "Start conversation" button (hover scale, press scale), button fades up after title. | MATCH | Implemented via Tailwind `animate-in` in `OnboardingHero.tsx`. | Playwright visual regression. |
| 2 | Start Click | Onboarding scales out fading, mic request, "Connecting..." for 800ms, active view fades in, dock slides up, timer starts. | MATCH | State transitions handled cleanly via `useVoiceAgent` and component opacity toggles in `page.tsx`. | `talk.spec.ts` connection state transitions. |
| 3 | Mic Denied | Rolls back to onboarding with visible error (original error was invisible). | DIFFERENT-INTENTIONAL (S3) | The rebuild catches the `getUserMedia` error, displays it, and cleanly resets state without locking the UI. | Playwright simulated permission denial. |
| 4 | End Session | Dock slides away, active view fades out, onboarding returns, reset all. Transcript shows "Session restarted". | MISSING | Add "Session restarted" marker injection logic into `useVoiceAgent.ts` `disconnect()` method. | Check transcript array length and content after disconnect. |
| 5 | Liquid Canvas & Status | Canvas orb states. Status label appears under orb on hover. Cursor ring becomes "Talk" lens over orb. | MISSING | Fix `opacity-0 hover:opacity-100` targeting in `VoiceOrbCanvas` so hovering the container shows text. Restore `data-cursor="orb"` logic to `CustomCursor.tsx` and `VoiceOrbCanvas.tsx`. | Mouse interaction test for orb container hover state. |
| 6 | Captions | Faded history line above current line, gradient-filled text, fade-out mask. Words stream in. | MATCH | Rendered precisely in `ActiveSession.tsx` using `[mask-image:...]` and `bg-clip-text`. | `talk.spec.ts` transcript generation. |
| 7 | Suggestion Chips | Staggered entrance, hover lift. Click hides chips and sends message. Hide on agent stream. | MATCH | Mapped sequentially with delays in `ActiveSession.tsx`. Hidden on partial text. | Chip click triggers `sendMockText`. |
| 8 | Header | Wordmark, status pill, theme toggle icon button in top right. | MISSING | The `Theme Toggle` button was omitted from `page.tsx` header. Must restore it. | Header layout verification. |
| 9 | Dock | Timer, mic toggle (slashed icon/tooltip), transcript, end. Tooltips on hover. | MATCH | Accurately built in `ControlDock.tsx`. Tooltips show on group-hover. | Dock button interaction tests. |
| 10 | Transcript Drawer | Right side desktop, bottom sheet mobile, click outside to close, bubbles, auto-scroll. | MATCH | Modeled accurately with Tailwind responsive prefixes in `TranscriptDrawer.tsx`. | Drawer toggle and layout tests. |
| 11 | Command Palette | Glass dialog, search, arrow-key navigation, enter to run. | MATCH | React state manages palette visibility (`CommandPalette.tsx`). | `talk.spec.ts` S5 command shortcut. |
| 12 | Keyboard | Space = mute, ⌘K = palette, ⌘J = drawer, Esc layered escapes. | MATCH | Added to `page.tsx` with protections for active inputs. | `talk.spec.ts` S5 shortcuts test. |
| 13 | Atmosphere & Cursor | Aurora lights, grain, dot+ring cursor hidden on touch. Light/dark themes. | DIFFERENT-INTENTIONAL (P2) | Atmosphere removed heavy `mix-blend-mode` and filters to ensure 60fps (Bug P2). Cursor currently lacks the `orb` state (see ID 5). | CDP CPU Throttle (4x) FPS trace. |
| 14 | Mock Mode | Loud mic input triggers a mock reply after 1.5s thinking and streams 250ms/word. | MISSING | `useVoiceAgent.ts` calculates `audioLevel` but doesn't trigger `sendMockText` on loud volume automatically. | Mock mode threshold test. |
