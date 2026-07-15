# Descent — project conventions

Award-style, scroll-driven narrative site: a single long-scroll journey through the
ocean's depths (sunlit surface → hadal trench). GSAP + ScrollTrigger is the motion
engine; Lenis provides smooth scroll. One continuous immersive page — no CMS, no
backend, no routing.

## Commands (pnpm only — npm is broken on this machine)

- `pnpm dev` — dev server on **port 5176** (strict; chosen for parallel local runs)
- `pnpm build` — `tsc -b && vite build`
- `pnpm lint` — ESLint, zero warnings allowed
- `pnpm format` — Prettier
- `pnpm test:e2e` — Playwright scroll + screenshot verification

## Non-negotiable rules

- **TS strict, no `any`.** Lint + build must be clean, no console errors.
- **Animate only `transform` / `opacity`.** Never animate layout props (width, height,
  top, left). No layout thrash, no CLS. Images lazy-loaded and explicitly sized.
- **Every ScrollTrigger lives inside a `gsap.context()`** and is reverted on cleanup.
  On resize, `ScrollTrigger.getAll().length` must stay stable — no leaks/duplicates.
- **`prefers-reduced-motion` is a first-class path.** When set: no Lenis, no pins, no
  scrub, no parallax — instant reveals, static gradient, story fully readable in
  logical DOM order. Gate every animation behind `usePrefersReducedMotion()`.
- **Mobile adapts, doesn't break** — pins / horizontal scroll simplify or linearize.

## Architecture

- `src/lib/gsap.ts` — the single place GSAP + ScrollTrigger are imported/registered.
- `src/hooks/useSmoothScroll.ts` — Lenis ↔ ScrollTrigger bridge (skipped when reduced).
- `src/hooks/usePrefersReducedMotion.ts` — reactive reduced-motion state.
- `src/hooks/useScrollProgress.ts` — global 0→1 progress (callback-based, no re-render).
- `src/components/` — cross-cutting UI (ScrollProgress, DepthGradient, Reveal).
- `src/scenes/` — one component per scroll set-piece (Hero, PinnedBeats, DescentPath,
  HandoffCreature, HorizontalReef, Closing). Each registers its own ScrollTriggers.

## Verify before every commit

`pnpm build` + `pnpm lint` (fix all) → dev server on 5176 → Playwright scroll +
screenshot each key position and actually view them → test the reduced-motion path →
confirm no console errors and no ScrollTrigger leaks on resize → commit.

Plan of record: `docs/plans/2026-07-15-descent-scrollytelling.md`.
