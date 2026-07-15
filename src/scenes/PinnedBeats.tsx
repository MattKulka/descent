import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type Beat = {
  depth: string;
  unit: string;
  title: string;
  body: string;
};

const BEATS: Beat[] = [
  {
    depth: '200',
    unit: 'm',
    title: 'The Twilight Zone',
    body: 'Sunlight thins to a cold blue dusk. Barely one percent of surface light reaches here — too little to feed a single leaf.',
  },
  {
    depth: '600',
    unit: 'm',
    title: 'The Oxygen Minimum',
    body: 'A suffocating layer where dissolved oxygen bottoms out. Life slows, hearts shrink, and every movement is rationed.',
  },
  {
    depth: '1000',
    unit: 'm',
    title: 'Where Light Is Made',
    body: 'Past the reach of the sun, the first living lights appear — flickers of blue-green the creatures make themselves.',
  },
];

/**
 * Pinned, scrubbed section: the panel holds while the descent advances through
 * three beats (crossfaded by scroll). A depth-gauge marker tracks downward.
 * Reduced motion → no pin; beats render as a normal readable vertical stack.
 */
export function PinnedBeats() {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const beats = gsap.utils.toArray<HTMLElement>(q('[data-beat]'));
      const marker = q('[data-gauge-marker]')[0] as HTMLElement | undefined;
      const track = q('[data-gauge-track]')[0] as HTMLElement | undefined;
      const pin = q('[data-pin]')[0] as HTMLElement;

      // Start: first beat visible, rest below and hidden.
      gsap.set(beats, { autoAlpha: 0, y: 40 });
      gsap.set(beats[0], { autoAlpha: 1, y: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=300%',
          pin,
          scrub: true,
          anticipatePin: 1,
        },
      });

      // Crossfade successive beats. Each transition occupies one timeline unit.
      for (let i = 1; i < beats.length; i += 1) {
        tl.to(beats[i - 1], { autoAlpha: 0, y: -40, duration: 0.5 }, i)
          .fromTo(
            beats[i],
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.5 },
            i + 0.15,
          );
      }

      // Gauge marker descends continuously across the whole pin.
      if (marker && track) {
        gsap.to(marker, {
          y: () => track.offsetHeight - marker.offsetHeight,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=300%',
            scrub: true,
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={rootRef}
      aria-label="Descent through the twilight zone"
      className="relative"
    >
      <div
        data-pin
        className="flex w-full items-center px-6 sm:px-12 motion-safe:h-screen motion-safe:overflow-hidden motion-reduce:min-h-screen motion-reduce:py-24"
      >
        <div className="mx-auto flex w-full max-w-5xl items-stretch gap-8 sm:gap-16">
          {/* Depth gauge */}
          <div className="flex w-16 shrink-0 flex-col items-center sm:w-24">
            <span className="mb-4 font-body text-[10px] uppercase tracking-[0.3em] text-foam/50">
              Depth
            </span>
            <div
              data-gauge-track
              className="relative w-px flex-1 bg-foam/20"
              aria-hidden="true"
            >
              <span
                data-gauge-marker
                className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-bioluminescent shadow-[0_0_12px_rgba(126,240,208,0.9)]"
              />
            </div>
          </div>

          {/* Beats (stacked; crossfaded on scroll) */}
          <div className="relative min-h-[16rem] flex-1">
            {BEATS.map((beat, i) => (
              <article
                key={beat.title}
                data-beat
                className={
                  // In the animated build these overlap; reduced motion stacks
                  // them via the fallback styles below.
                  'motion-safe:absolute motion-safe:inset-0 motion-reduce:relative motion-reduce:mb-16 flex flex-col justify-center'
                }
                style={{ zIndex: BEATS.length - i }}
              >
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="font-display text-7xl font-semibold leading-none text-foam sm:text-8xl">
                    {beat.depth}
                  </span>
                  <span className="font-body text-xl text-foam/60">{beat.unit}</span>
                </div>
                <h2 className="mb-4 font-display text-3xl font-medium text-bioluminescent sm:text-4xl">
                  {beat.title}
                </h2>
                <p className="max-w-md font-body text-base leading-relaxed text-foam/80 sm:text-lg">
                  {beat.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
