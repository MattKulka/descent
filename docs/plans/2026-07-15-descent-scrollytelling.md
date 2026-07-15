# Descent — Scroll-Driven Story Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) to implement this plan milestone-by-milestone.

**Goal:** Build an award-style, scroll-driven narrative site — a single long-scroll journey through the ocean's depths (sunlit surface → hadal zone) with pinning, parallax, self-drawing SVG paths, a cross-section morphing element, a horizontal-scroll segment, and a continuously shifting depth gradient.

**Architecture:** One continuous immersive page. GSAP + ScrollTrigger is the motion engine (pinning, scrubbing, timelines); Lenis provides smooth scroll and is wired into ScrollTrigger via a rAF/`scrollerProxy`-style bridge. Each "scene" is a self-contained React component that registers its own ScrollTrigger(s) in a `useLayoutEffect` guarded by a `gsap.context()` for automatic cleanup on unmount/resize. A single depth/progress value drives the global background gradient and lighting so scenes feel continuous rather than isolated. `prefers-reduced-motion` short-circuits every animation to an instant, static, readable version.

**Tech Stack:** React 18 + TypeScript (strict) · Vite · GSAP + ScrollTrigger · Lenis · Tailwind CSS + custom CSS · SVG · Playwright (scroll+screenshot verification) · Vitest (only if non-trivial logic appears).

**Location:** `C:\Users\matth\Desktop\descent` · **Dev server port: 5176** (`server.port` in `vite.config.ts`).

---

## Guiding constraints (apply to every task)

- **TS strict, no `any`.** ESLint + Prettier clean. No console errors.
- **Animate only `transform`/`opacity`.** No animating layout properties (width/height/top/left). No layout thrash, no CLS. Images lazy-loaded and explicitly sized.
- **Every ScrollTrigger lives inside a `gsap.context()`** and is reverted on cleanup. On resize, triggers must not duplicate or leak — verify via a resize test.
- **`prefers-reduced-motion` is honored fully.** A shared `usePrefersReducedMotion()` hook + a `reducedMotion` guard: when true, render final states instantly, register no scrubbed/pinned triggers, no parallax. The story must still be fully readable and in logical DOM order.
- **Mobile adapts, doesn't break.** Pins and horizontal scroll simplify or linearize on small viewports.
- **Verify before commit** (see per-milestone loop). Commit after each milestone.

---

## Proposed file structure

```
descent/
├── CLAUDE.md                      # project conventions, port, motion rules
├── README.md                      # case study (written in Milestone 6)
├── index.html
├── package.json
├── vite.config.ts                 # server.port = 5176
├── tsconfig.json / tsconfig.node.json
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.cjs / .prettierrc
├── playwright.config.ts
├── docs/plans/2026-07-15-descent-scrollytelling.md
├── tests/
│   └── scroll.spec.ts             # Playwright: scroll to positions + screenshot
├── public/
│   └── (optimized images / textures, added as needed)
└── src/
    ├── main.tsx
    ├── App.tsx                    # composes scenes in order
    ├── index.css                  # Tailwind layers + base custom CSS
    ├── lib/
    │   ├── gsap.ts                # gsap + ScrollTrigger registration (single import site)
    │   └── depth.ts               # depth→color/lighting mapping helpers
    ├── hooks/
    │   ├── useSmoothScroll.ts     # Lenis ↔ ScrollTrigger bridge
    │   ├── usePrefersReducedMotion.ts
    │   └── useScrollProgress.ts   # global 0–1 progress for the indicator
    ├── components/
    │   ├── ScrollProgress.tsx     # fixed progress bar
    │   ├── DepthGradient.tsx      # fixed full-viewport bg driven by scroll depth
    │   └── Reveal.tsx             # reveal-on-enter wrapper (stagger-aware)
    └── scenes/
        ├── Hero.tsx               # M1: parallax + load animation
        ├── PinnedBeats.tsx        # M2: pinned, scrubbed multi-beat section
        ├── DescentPath.tsx        # M3: self-drawing SVG path
        ├── HandoffCreature.tsx    # M4: element persisting/morphing across sections
        ├── HorizontalReef.tsx     # M5: horizontal-scroll segment
        └── Closing.tsx            # M5: CTA + scroll-to-top
```

---

## Milestone 0 — Scaffold + motion system + progress bar

**Outcome:** Vite+TS+Tailwind app on port 5176; Lenis wired to ScrollTrigger; a working global scroll-progress bar; lint/build clean; `CLAUDE.md` committed.

**Files:** `package.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.ts`, `postcss.config.js`, `.eslintrc.cjs`, `.prettierrc`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/lib/gsap.ts`, `src/hooks/useSmoothScroll.ts`, `src/hooks/usePrefersReducedMotion.ts`, `src/hooks/useScrollProgress.ts`, `src/components/ScrollProgress.tsx`, `CLAUDE.md`, `playwright.config.ts`, `tests/scroll.spec.ts`.

**Steps:**
1. `pnpm create vite@latest . --template react-ts` in the folder (pnpm — npm is broken on this machine). Then `pnpm add gsap lenis` and `pnpm add -D tailwindcss postcss autoprefixer @playwright/test eslint prettier`.
2. Configure Tailwind (`content` globs, ocean color tokens), PostCSS, `vite.config.ts` with `server.port = 5176`, tsconfig `strict: true`.
3. `src/lib/gsap.ts`: import gsap + ScrollTrigger, `gsap.registerPlugin(ScrollTrigger)`, export both.
4. `usePrefersReducedMotion.ts`: subscribe to `matchMedia('(prefers-reduced-motion: reduce)')`.
5. `useSmoothScroll.ts`: instantiate Lenis, drive it from `gsap.ticker` (`lenis.raf(time*1000)`), call `ScrollTrigger.update` on Lenis `scroll`, `ScrollTrigger.refresh()` after setup; **skip Lenis entirely when reduced-motion is on** (native scroll). Full cleanup on unmount.
6. `ScrollProgress.tsx` + `useScrollProgress.ts`: fixed top bar scaling `transform: scaleX(progress)`.
7. Placeholder full-height sections in `App.tsx` so there is scrollable content.
8. `CLAUDE.md`: record port 5176, pnpm, motion rules (transforms/opacity only, gsap.context cleanup, reduced-motion contract).
9. **Verify:** `pnpm build` + lint clean; dev server on 5176; Playwright scrolls top→bottom, screenshots; confirm progress bar fills and no console errors. **Commit.**

---

## Milestone 1 — Hero (parallax + load animation)

**Outcome:** A striking hero: layered parallax (2–3 depth layers reacting to scroll) and an on-load type/element animation. Reduced-motion → static hero, text visible immediately.

**Files:** `src/scenes/Hero.tsx`, `src/App.tsx` (mount), `src/index.css` (type styles), add a variable font (self-hosted, `font-display: swap`).

**Steps:**
1. Build hero layout: layered SVG/gradient sea layers + headline using the variable font.
2. Load timeline: staggered headline reveal (opacity/translateY) on mount, guarded by reduced-motion (instant when reduced).
3. Parallax: ScrollTrigger scrub mapping scroll → `yPercent` on each layer (different rates). Inside `gsap.context()`.
4. **Verify:** screenshot at load and at partial scroll; confirm layers offset and headline animates; reduced-motion path static; no leaks on resize. **Commit.**

---

## Milestone 2 — Pinned, scrubbed multi-beat section

**Outcome:** A section that pins the viewport and advances through several "beats" (text/visual states) scrubbed by scroll, then releases.

**Files:** `src/scenes/PinnedBeats.tsx`, `src/App.tsx`.

**Steps:**
1. Tall spacer wrapper; inner pinned panel via `ScrollTrigger { pin: true, scrub: true, start, end }`.
2. Timeline with 3–4 beats (crossfade/translate between states) tied to scrub.
3. Reduced-motion: no pin, stack beats as normal readable blocks.
4. **Verify:** screenshot at each beat's scroll offset; confirm pin holds and beats transition; resize test for no duplicate pins. **Commit.**

---

## Milestone 3 — Self-drawing SVG path + depth gradient/lighting

**Outcome:** An SVG "descent line"/creature outline draws itself via `strokeDashoffset` as you scroll; the global background gradient + lighting shift continuously with depth.

**Files:** `src/scenes/DescentPath.tsx`, `src/components/DepthGradient.tsx`, `src/lib/depth.ts`, `src/App.tsx`.

**Steps:**
1. `DepthGradient.tsx`: fixed full-viewport background; a single scroll-progress value maps (via `depth.ts`) to interpolated gradient stops + a light-shaft opacity that fades with depth.
2. `DescentPath.tsx`: SVG path, set `pathLength`, animate `strokeDashoffset` from full→0 on scrub.
3. Reduced-motion: gradient set to a representative mid/static state; path shown fully drawn.
4. **Verify:** screenshots at several depths; confirm color transitions and path draw progress; no CLS from the fixed layer. **Commit.**

---

## Milestone 4 — Cross-section morph / hand-off element

**Outcome:** A persistent element (diver/submersible) that travels and morphs across section boundaries rather than each section being isolated — the signature "hand-off" beat.

**Files:** `src/scenes/HandoffCreature.tsx` (or a portal/fixed element coordinated across scenes), `src/App.tsx`.

**Steps:**
1. Single persistent element positioned in a fixed/overlay layer, its `transform` (x/y/scale/rotate) and SVG morph driven by one master ScrollTrigger spanning the relevant sections.
2. Ensure it reads as continuous across the M2/M3 boundaries (shared timeline, no visual jump).
3. Reduced-motion: element static at a sensible resting position per section (or shown once).
4. **Verify:** screenshots across the boundary; confirm continuous motion/morph; no leak. **Commit.**

---

## Milestone 5 — Horizontal-scroll segment + reveal-on-enter + closing CTA

**Outcome:** A horizontal-scroll reef segment driven by vertical scroll; reveal-on-enter with tasteful stagger applied to text/media; a closing section with CTA + scroll-to-top.

**Files:** `src/scenes/HorizontalReef.tsx`, `src/components/Reveal.tsx`, `src/scenes/Closing.tsx`, `src/App.tsx`.

**Steps:**
1. `HorizontalReef.tsx`: pinned wrapper translating an inner track on X by `-(track.width - viewport)` across the pin duration.
2. `Reveal.tsx`: IntersectionObserver/ScrollTrigger reveal (opacity/translateY) with stagger; used across scenes.
3. `Closing.tsx`: CTA + scroll-to-top button (Lenis `scrollTo(0)` / native when reduced).
4. Reduced-motion: horizontal segment linearizes to a vertical stack; reveals become instant.
5. Mobile: horizontal segment simplifies (stack or reduced pin).
6. **Verify:** screenshots across the horizontal pan, reveals, and closing; reduced-motion + mobile paths; scroll-to-top works. **Commit.**

---

## Milestone 6 — Polish: reduced-motion, mobile, performance, README

**Outcome:** Definition-of-Done satisfied end to end.

**Steps:**
1. Full `prefers-reduced-motion` audit — every scene: no motion, readable, logical DOM order.
2. Mobile adaptation pass (responsive at 390/768/1280) — no broken pins/overlap.
3. Performance: confirm transforms/opacity only, `will-change` used judiciously, images lazy + sized, no CLS; run Lighthouse and note the score.
4. Accessibility: contrast check, keyboard reachability of interactive elements, alt text.
5. Cleanup audit: resize repeatedly, assert `ScrollTrigger.getAll().length` stable (no leaks/dupes).
6. `README.md` case study: capture a GIF/video of the scroll; document pinning/scrub architecture, the hand-off technique, and the reduced-motion strategy.
7. **Verify + Commit.**

---

## Self-verification loop (every milestone, before committing)

`pnpm build` + lint (fix all) → dev server on 5176 → Playwright scroll to each key position + screenshot, **and actually view them** to confirm beats land and nothing overlaps → test the `prefers-reduced-motion` path → confirm no console errors and `ScrollTrigger.getAll()` stable across resize → commit. Make reasonable senior calls on ambiguity, note them in commit messages; stop only on real blockers.

## Non-goals

No CMS, no backend, no routing. One continuous page. Depth of craft over breadth of content.
