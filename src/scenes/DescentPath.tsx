import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const PATH_D =
  'M200,24 C120,150 300,250 200,380 C110,500 300,600 200,776';

type Caption = { top: string; depth: string; label: string; side: 'left' | 'right' };

const CAPTIONS: Caption[] = [
  { top: '10%', depth: '1,200 m', label: 'The Midnight Zone', side: 'right' },
  { top: '45%', depth: '2,800 m', label: 'Eternal Dark', side: 'left' },
  { top: '78%', depth: '4,000 m', label: 'The Abyss Begins', side: 'right' },
];

/**
 * Self-drawing descent trail. A pinned SVG path draws itself via
 * strokeDashoffset as you scroll; a glowing tip rides the drawing front and
 * depth captions reveal in sequence. Reduced motion shows the path fully
 * drawn with all captions visible.
 */
export function DescentPath() {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const path = q('[data-path]')[0] as unknown as SVGPathElement | undefined;
      const tip = q('[data-tip]')[0] as unknown as SVGGElement | undefined;
      const pin = q('[data-pin]')[0] as HTMLElement;
      const caps = gsap.utils.toArray<HTMLElement>(q('[data-cap]'));
      if (!path || !tip) return;

      const total = path.getTotalLength();
      path.style.strokeDasharray = String(total);

      const moveTip = (d: number) => {
        const pt = path.getPointAtLength(d * total);
        tip.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      };

      if (prefersReducedMotion) {
        path.style.strokeDashoffset = '0';
        moveTip(1);
        gsap.set(caps, { autoAlpha: 1, y: 0 });
        return;
      }

      path.style.strokeDashoffset = String(total);
      gsap.set(caps, { autoAlpha: 0, y: 20 });
      const draw = (d: number) => {
        path.style.strokeDashoffset = String(total * (1 - d));
        moveTip(d);
      };
      draw(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=150%',
          pin,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => draw(self.progress),
        },
      });
      caps.forEach((cap, i) => {
        tl.fromTo(
          cap,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.2 },
          0.15 + i * 0.3,
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={rootRef} aria-label="Descent into the midnight zone and abyss">
      <div
        data-pin
        className="relative flex min-h-screen w-full items-center justify-center overflow-hidden py-16"
      >
        <div className="relative h-[78vh] max-h-[760px]">
          <svg
            viewBox="0 0 400 800"
            className="h-full w-auto overflow-visible"
            role="img"
            aria-label="A trail descending from the midnight zone into the abyss"
          >
            <defs>
              <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ef0d0" />
                <stop offset="100%" stopColor="#2ea6cc" />
              </linearGradient>
            </defs>
            {/* Faint full guide so the composition reads before drawing */}
            <path d={PATH_D} fill="none" stroke="#eaf6fb" strokeOpacity="0.08" strokeWidth="2" />
            {/* The self-drawing trail */}
            <path
              data-path
              d={PATH_D}
              fill="none"
              stroke="url(#trail)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Glowing drawing tip */}
            <g data-tip>
              <circle r="10" fill="#7ef0d0" opacity="0.25" />
              <circle r="4" fill="#eaf6fb" />
            </g>
          </svg>

          {/* Depth captions: centred over the trail on mobile (so they never
              overflow a narrow viewport), fanned out to the sides on sm+. */}
          {CAPTIONS.map((c) => (
            <div
              key={c.label}
              data-cap
              className={`absolute left-1/2 w-[80vw] -translate-x-1/2 text-center sm:w-auto sm:translate-x-0 sm:whitespace-nowrap ${
                c.side === 'right'
                  ? 'sm:left-full sm:ml-10 sm:text-left'
                  : 'sm:left-auto sm:right-full sm:mr-10 sm:text-right'
              }`}
              style={{ top: c.top }}
            >
              <div className="font-display text-3xl font-semibold text-foam sm:text-4xl">
                {c.depth}
              </div>
              <div className="font-body text-xs uppercase tracking-[0.3em] text-bioluminescent">
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
