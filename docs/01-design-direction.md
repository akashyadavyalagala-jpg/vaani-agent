# Vaani (వాణి) - Design Direction

## 1. Concrete Design Brief
Derived from studying premium, award-winning sites on Godly Design (such as Superpower, Cloaked, Paradigm, Reevo, Linear, and Vercel), Vaani adopts a **Premium Dark AI** aesthetic. The design relies on dramatic contrast, precise typography, sheer minimalism, and sophisticated micro-interactions. The interface must feel like interacting with an intelligent, almost magical entity rather than a traditional SaaS web form.

### Reference Sites & Learnings
- **Superpower:** Mastery of dark mode with subtle glowing accents. Teaches us to use pure blacks (Ink) and high-contrast typography.
- **Cloaked:** Incredible layout rhythm and bento-box structuring.
- **Paradigm:** Smooth, hardware-accelerated WebGL interactions that feel physical.
- **Reevo:** Striking hero patterns and single-accent color strategy.
- **Linear:** The gold standard for precision, keyboard-first interactions, and micro-animations.
- **Vercel:** Unmatched typography scaling and crisp, utility-first aesthetics without visual clutter.

## 2. Design Principles
1. **Focus on the Voice:** The primary UI element is the WebGL voice orb. Everything else is secondary and recedes into the background.
2. **Dark by Default, Light by Intent:** The app is inherently dark, utilizing deep Ink and Graphite, making the warm Turmeric accent pop.
3. **Cinematic Typography:** Extreme contrast between large expressive display serif headers and utilitarian grotesk UI text.
4. **Physicality in Motion:** Animations should feel grounded in physics (mass, friction, tension), avoiding linear robotic easing.
5. **Silence is Golden:** Negative space is a core component. Do not pack information densely.
6. **No Chrome:** Remove unnecessary borders, generic shadows, and standard web UI constructs.
7. **Bento over Lists:** When data must be shown, use crisp bento grids with 1px borders or subtle gradients.
8. **Feedback loop:** Every user action or AI state change (listening, thinking, speaking) must have immediate, satisfying visual feedback.

## 3. Design Tokens ("Turmeric & Ink")
### Color Palette
- **Ink (Backgrounds):** `#0A0A0B` (Primary Background)
- **Graphite Scale (UI Elements & Text):**
  - Graphite 900: `#171719` (Surfaces)
  - Graphite 800: `#2A2A2E` (Borders)
  - Graphite 500: `#7A7A85` (Muted Text)
  - Graphite 100: `#EDEDF0` (Primary Text)
- **Warm Paper (Secondary/Light Theme):** `#F2EEE6`
- **Turmeric (Hot Accent):** `#F59E0B` (Active AI states, Primary CTA)
- **Vermilion (Recording/Alert):** `#EF4444`

### Typography
- **Display (English):** Instrument Serif
- **UI & Body (English):** Geist
- **Telugu (Display & UI):** Noto Serif Telugu / Noto Sans Telugu
- **Leading (Line-Height) Overrides:** Telugu glyphs require `1.6` to `1.8` line-height compared to the Latin `1.4` to avoid clipping of upper/lower matras.

## 4. Motion Principles
- **Library:** Framer Motion & GSAP + ScrollTrigger.
- **Curves:** Use custom spring physics (`stiffness: 400, damping: 30`) rather than ease-in-out.
- **Durations:** Snappy for UI micro-interactions (150ms-250ms), cinematic for state transitions (600ms-800ms).
- **Stagger:** Lists and grids always stagger in (e.g., `staggerChildren: 0.05`).
- **Reduced Motion:** Respect `prefers-reduced-motion` media query, falling back to simple opacity fades.
- **Voice Orb:** OGL/WebGL shader driven by audio frequency data.

## 5. Accessibility Rules
- Ensure AA contrast ratios, specifically checking Turmeric against Ink.
- Full keyboard navigability.
- Screen reader announcements for AI state changes (Listening, Processing, Speaking).

## 6. The "Never Do" List
- **NO** purple-to-pink gradient AI clichés.
- **NO** stock illustrations or uninspired vector art.
- **NO** generic SaaS card grids with heavy drop shadows.
- **NO** emojis as UI icons (use custom SVGs or Lucide icons).
- **NO** "As an AI..." textual apologies in the UI.
