import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const TITLE_LINE_ONE = ['Into', 'the'];
const TITLE_LINE_TWO = ['Deep'];

/**
 * Opening scene: layered parallax sea + light shafts, with a staggered
 * type-in on load. Under reduced motion everything is shown instantly and
 * no ScrollTriggers/parallax are registered.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      // Animate these specific elements (not the h1 wrapper — setting the h1
      // itself to opacity 0 would hide its word spans).
      const reveal = q(
        '[data-hero="overline"], [data-word], [data-hero="subtitle"], [data-hero="cue"]',
      );

      if (prefersReducedMotion) {
        // Static, fully-readable state — no motion at all.
        gsap.set(reveal, { opacity: 1, y: 0 });
        return;
      }

      // --- Load-in timeline ---------------------------------------------
      gsap.set(reveal, { opacity: 0, y: 40 });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('[data-hero="overline"]', { opacity: 1, y: 0, duration: 0.8 }, 0.1)
        .to(q('[data-word]'), { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.25)
        .to('[data-hero="subtitle"]', { opacity: 1, y: 0, duration: 0.9 }, 0.9)
        .to('[data-hero="cue"]', { opacity: 1, y: 0, duration: 0.8 }, 1.2);

      // Gentle looping bob on the scroll cue.
      gsap.to('[data-hero="cue"] span', {
        y: 8,
        repeat: -1,
        yoyo: true,
        duration: 1.1,
        ease: 'sine.inOut',
      });

      // --- Scroll parallax ----------------------------------------------
      // Each layer drifts at its own rate as the hero scrolls away, creating
      // depth. Transform/opacity only.
      const layers = gsap.utils.toArray<HTMLElement>(q('[data-speed]'));
      layers.forEach((layer) => {
        const speed = Number(layer.dataset.speed ?? '0');
        gsap.to(layer, {
          yPercent: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Fade the whole content column out as we leave, so it hands off cleanly.
      gsap.to('[data-hero="content"]', {
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={rootRef}
      aria-label="Into the Deep — introduction"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background gradient — slowest layer */}
      <div
        data-speed="18"
        className="absolute inset-0 bg-gradient-to-b from-depth-surface via-[#37aacf] to-depth-twilight will-change-transform"
      />

      {/* Sun shafts / god rays */}
      <svg
        data-speed="9"
        className="absolute inset-0 h-full w-full will-change-transform"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eaf6fb" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#eaf6fb" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g fill="url(#ray)">
          <polygon points="120,-50 220,-50 360,820 240,820" opacity="0.7" />
          <polygon points="430,-50 500,-50 560,820 470,820" opacity="0.5" />
          <polygon points="720,-50 820,-50 760,820 640,820" opacity="0.6" />
          <polygon points="980,-50 1060,-50 1160,820 1040,820" opacity="0.45" />
        </g>
      </svg>

      {/* Drifting bubbles — fastest background layer */}
      <div data-speed="-42" className="absolute inset-0 will-change-transform" aria-hidden="true">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-foam/30 ring-1 ring-foam/20"
            style={{ left: b.left, top: b.top, width: b.size, height: b.size }}
          />
        ))}
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div data-hero="content" className="max-w-3xl text-center">
          <p
            data-hero="overline"
            className="mb-6 font-body text-xs uppercase tracking-[0.5em] text-foam/70"
          >
            Reef · Twilight · Abyss
          </p>
          <h1 className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-foam sm:text-7xl md:text-8xl">
            <span className="block">
              {TITLE_LINE_ONE.map((w) => (
                <span key={w} data-word className="mr-4 inline-block">
                  {w}
                </span>
              ))}
            </span>
            <span className="block italic text-bioluminescent">
              {TITLE_LINE_TWO.map((w) => (
                <span key={w} data-word className="inline-block">
                  {w}
                </span>
              ))}
            </span>
          </h1>
          <p
            data-hero="subtitle"
            className="mx-auto mt-8 max-w-xl font-body text-base leading-relaxed text-foam/80 sm:text-lg"
          >
            Descend from the sunlit surface into the crushing dark — where light
            fades, pressure builds, and life learns to glow.
          </p>
          <div
            data-hero="cue"
            className="mt-14 flex flex-col items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-foam/60"
          >
            Scroll to descend
            <span aria-hidden="true" className="text-lg">
              ↓
            </span>
          </div>
        </div>
      </div>

      {/* Foreground darkening vignette toward the next zone */}
      <div
        data-speed="-8"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-depth-twilight will-change-transform"
        aria-hidden="true"
      />
    </section>
  );
}

// Deterministic bubble field (no layout shift, no per-render randomness).
const BUBBLES: Array<{ left: string; top: string; size: string }> = [
  { left: '12%', top: '68%', size: '10px' },
  { left: '22%', top: '40%', size: '6px' },
  { left: '34%', top: '78%', size: '14px' },
  { left: '46%', top: '55%', size: '8px' },
  { left: '58%', top: '30%', size: '5px' },
  { left: '67%', top: '72%', size: '12px' },
  { left: '78%', top: '48%', size: '7px' },
  { left: '86%', top: '62%', size: '9px' },
  { left: '18%', top: '85%', size: '5px' },
  { left: '72%', top: '20%', size: '6px' },
];
