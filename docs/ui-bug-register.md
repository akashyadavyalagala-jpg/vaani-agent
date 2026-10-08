# UI Bug Register

This document serves as the audit register for the prototype `voice-agent-reference.html`. Every bug has been confirmed by reading the reference source, severity assigned, and a fix strategy outlined.

## Layout and Visual Bugs
| ID | Severity | Evidence | Fix Strategy | Guard Test |
|---|---|---|---|---|
| L1 | Medium | `.dock.visible` applies `translateX(-50%)` overriding `.dock-container` causing double transform. | Apply transform only to the container, or use flex centering on a full-width wrapper. | Visual regression test of dock centering. |
| L2 | High | `.dock { width: 90% }` collapses because parent `.dock-container` is strictly positioned. | Set `width: 100%` on container and max-width constraints on the dock itself. | Playwright mobile layout test. |
| L3 | High | `.hero-title` uses `overflow:hidden` and `line-height:1`, clipping descenders. | Remove `overflow:hidden` on container, use `clip-path` per-word for reveal, increase `line-height`. | Visual test with descender characters. |
| L4 | High | Drawer uses `80vh` and captions are fixed to `80px` clipping long text on mobile. | Use `80dvh` for drawer, `max-height`/`auto` for captions with scrolling. | Overflow text test on 320px viewport. |
| L5 | Medium | Dialog transitions missing `@starting-style`. Cursor renders under dialog. | Implement Framer Motion `AnimatePresence` for dialogs. Manage z-index correctly. | E2E transition timing check. |

## State and Logic Bugs
| ID | Severity | Evidence | Fix Strategy | Guard Test |
|---|---|---|---|---|
| S1 | Critical | `muted` modeled as mutually exclusive state replacing `listening`. | Extract `isMuted` to independent boolean state decoupled from `agentState`. | Unit test: state machine transitions while muted. |
| S2 | High | Double-click Start creates two `monitor` loops and WebSocket connections. | Disable button during `connecting` state. Debounce/lock connection attempts. | E2E rapid double-click on Start. |
| S3 | Medium | Mic failure text hidden in UI; `showError()` proceeds to `endSession()` blindly. | Show toast/alert on error; rollback cleanly to idle without 2s delay. | Playwright simulated permission denial. |
| S4 | Low | Mock mode duplicates text because `handleTranscript` assumes partial. | Remove mock duplication; ensure strict `role` delineation in message reducer. | Mock mode E2E test. |
| S5 | Medium | `Esc` ends call instantly; Space hijacked globally. | Two-step confirmation for Esc with 5s undo. Prevent default Space only on body focus. | Keyboard navigation test suite. |
| S6 | Low | Command palette search does not filter; stubs used. | Implement fuzzy search over actions array. Wire up real theme/voice contexts. | E2E Command Palette search test. |
| S7 | Medium | Audio RMS uses simple average without smoothing. | Implement proper RMS math with exponential moving average (attack/release). | Audio buffer unit test. |
| S8 | High | `AudioContext` fails on iOS without gesture resume. | `audioCtx.resume()` explicitly bound to the Start button click handler. | Safari/iOS capability test. |
| S9 | Medium | `toggleMute` only sets `track.enabled = false`. | Completely stop track and replace to kill browser mic indicator. | MediaStream track inspection test. |

## Security and Accessibility Bugs
| ID | Severity | Evidence | Fix Strategy | Guard Test |
|---|---|---|---|---|
| A1 | Critical | `bubble.innerHTML` used for transcript text (XSS). | React safely escapes by default (`{text}`). Avoid `dangerouslySetInnerHTML`. | XSS payload injection test. |
| A2 | High | `user-scalable=no` violates WCAG. | Remove from meta tags. Rely on proper CSS sizing. | Axe audit. |
| A3 | High | No focus traps, ARIA roles missing on palette, low contrast. | Use `focus-trap-react`, implement `role="combobox"`, ensure 4.5:1 contrast. | Axe audit & NVDA screen reader test. |

## Rendering and Performance Bugs
| ID | Severity | Evidence | Fix Strategy | Guard Test |
|---|---|---|---|---|
| P1 | High | `requestAnimationFrame` runs constantly, allocating arrays. | Pause `rAF` via `IntersectionObserver`. Preallocate Float32Arrays. | Chrome DevTools memory allocation trace. |
| P2 | Critical | Heavy GPU cost: blurred aurora, SVG feTurbulence, `mix-blend-mode`. | Use CSS radial gradients without blending. Tiled WebP noise overlay. | CDP CPU Throttle (4x) FPS trace. |
| P3 | Medium | Orb seam kinks (starts at p0). Gray fringing on transparent gradients. | Start path at midpoint. Fade gradient to same color with `alpha 0`. | Visual regression test of orb. |
| P4 | Medium | Cursor updates via inline transform on every mousemove. | Batch cursor updates via single `rAF` loop with lerp. | FPS trace during rapid mouse movement. |

## Telugu specific Bugs
| ID | Severity | Evidence | Fix Strategy | Guard Test |
|---|---|---|---|---|
| T1 | High | English fonts used, breaking Telugu conjuncts and spacing. | Use `Noto Sans/Serif Telugu`. Apply `Intl.Segmenter` for grapheme splitting. | Visual test of Telugu conjuncts. |
| T2 | Low | Mock copy uses English strings. | Use `i18n` strings, translate chips to natural spoken Telugu. | Content validation test. |
