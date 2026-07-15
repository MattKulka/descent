import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type Creature = {
  name: string;
  depth: string;
  body: string;
  glyph: ReactNode;
};

const stroke = { fill: 'none', stroke: '#7ef0d0', strokeWidth: 2.5, strokeLinecap: 'round' as const };

const CREATURES: Creature[] = [
  {
    name: 'Anglerfish',
    depth: '2,000 m',
    body: 'Lures prey toward its jaws with a living lantern grown from its own spine.',
    glyph: (
      <>
        <path d="M62,50 C56,28 20,26 12,50 C20,74 56,72 62,50 Z" {...stroke} />
        <path d="M62,50 L86,36 L80,50 L86,64 Z" {...stroke} />
        <path d="M52,34 q16,-22 4,-30" {...stroke} />
        <circle cx="56" cy="4" r="4" fill="#7ef0d0" />
        <circle cx="40" cy="44" r="3" fill="#eaf6fb" />
      </>
    ),
  },
  {
    name: 'Dumbo Octopus',
    depth: '3,500 m',
    body: 'Flaps a pair of ear-like fins nearly two miles down — deeper than any other octopus.',
    glyph: (
      <>
        <path d="M50,24 C34,24 30,42 32,54 C34,66 66,66 68,54 C70,42 66,24 50,24 Z" {...stroke} />
        <path d="M32,40 C18,34 16,48 28,50" {...stroke} />
        <path d="M68,40 C82,34 84,48 72,50" {...stroke} />
        <path d="M40,62 q4,14 -2,20 M50,64 v20 M60,62 q-4,14 2,20" {...stroke} />
      </>
    ),
  },
  {
    name: 'Vampire Squid',
    depth: '900 m',
    body: 'Turns itself inside out when threatened, cloaked in a web of light-tipped spines.',
    glyph: (
      <>
        <path d="M50,20 C38,20 34,36 38,52 C42,64 58,64 62,52 C66,36 62,20 50,20 Z" {...stroke} />
        <path d="M40,54 L30,84 M46,58 L42,86 M54,58 L58,86 M60,54 L70,84" {...stroke} />
        <circle cx="30" cy="84" r="2.5" fill="#7ef0d0" />
        <circle cx="70" cy="84" r="2.5" fill="#7ef0d0" />
      </>
    ),
  },
  {
    name: 'Snailfish',
    depth: '8,300 m',
    body: 'The deepest fish ever filmed — a translucent drifter at home in the hadal trench.',
    glyph: (
      <>
        <path d="M22,50 C30,32 60,34 74,48 C80,54 80,46 88,50 L80,58 C60,70 30,68 22,50 Z" {...stroke} />
        <path d="M74,48 q10,-6 12,-14 M80,58 q8,6 12,4" {...stroke} />
        <circle cx="38" cy="48" r="2.5" fill="#eaf6fb" />
      </>
    ),
  },
  {
    name: 'Giant Isopod',
    depth: '2,600 m',
    body: 'A deep-sea scavenger the size of a house cat, armored against the crushing dark.',
    glyph: (
      <>
        <path d="M50,22 C34,22 30,40 30,52 C30,68 40,78 50,78 C60,78 70,68 70,52 C70,40 66,22 50,22 Z" {...stroke} />
        <path d="M34,40 H66 M32,50 H68 M34,60 H66" {...stroke} />
        <path d="M44,22 L40,12 M56,22 L60,12" {...stroke} />
        <path d="M30,46 L20,44 M70,46 L80,44 M30,58 L20,60 M70,58 L80,60" {...stroke} />
      </>
    ),
  },
];

/**
 * Horizontal-scroll segment driven by vertical scroll: the viewport pins and a
 * track of hadal-zone creatures pans sideways. Reduced motion / small screens
 * fall back to a normal vertical stack (see motion-reduce classes + early
 * return).
 */
export function HorizontalReef() {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const track = q('[data-track]')[0] as HTMLElement;
      const pin = q('[data-pin]')[0] as HTMLElement;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => '+=' + distance(),
          pin,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={rootRef} aria-label="Creatures of the deep">
      <div
        data-pin
        className="motion-safe:h-screen motion-safe:overflow-hidden motion-reduce:py-20"
      >
        <div
          data-track
          className="flex motion-safe:h-full motion-safe:flex-row motion-safe:items-center motion-safe:flex-nowrap motion-reduce:flex-col motion-reduce:items-center motion-reduce:gap-16"
        >
          {/* Intro panel */}
          <div className="flex w-[86vw] shrink-0 flex-col justify-center px-8 sm:w-[46vw] sm:px-16 lg:w-[34vw]">
            <p className="font-body text-xs uppercase tracking-[0.4em] text-bioluminescent">
              6,000 – 11,000 m
            </p>
            <h2 className="mt-4 font-display text-5xl font-semibold text-foam sm:text-6xl">
              Life at the Bottom
            </h2>
            <p className="mt-6 max-w-sm font-body text-base leading-relaxed text-foam/70">
              In the hadal trenches — the deepest places on Earth — life not only
              survives, it thrives. Scroll on to meet a few of the neighbours.
            </p>
            <p className="mt-8 hidden items-center gap-3 font-body text-xs uppercase tracking-[0.3em] text-foam/50 motion-safe:flex">
              Scroll <span aria-hidden="true">→</span>
            </p>
          </div>

          {/* Creature panels */}
          {CREATURES.map((c, i) => (
            <article
              key={c.name}
              className="flex w-[86vw] shrink-0 flex-col justify-center px-8 sm:w-[46vw] sm:px-16 lg:w-[30vw]"
            >
              <div className="mb-6 h-40 w-40">
                <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
                  {c.glyph}
                </svg>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="font-body text-sm text-bioluminescent/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-body text-xs uppercase tracking-[0.3em] text-foam/50">
                  {c.depth}
                </span>
              </div>
              <h3 className="mt-2 font-display text-4xl font-medium text-foam">{c.name}</h3>
              <p className="mt-4 max-w-sm font-body text-base leading-relaxed text-foam/75">
                {c.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
