import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Distant bioluminescent creatures glimmering in the dark — scattered off the
// centre line so they never collide with the travelling submersible.
const LIGHTS = [
  { left: '14%', top: '42%', size: 6, hue: '#7ef0d0' },
  { left: '82%', top: '36%', size: 5, hue: '#8fd0ff' },
  { left: '24%', top: '68%', size: 4, hue: '#7ef0d0' },
  { left: '73%', top: '72%', size: 7, hue: '#7ef0d0' },
  { left: '88%', top: '58%', size: 4, hue: '#b6a8ff' },
  { left: '9%', top: '82%', size: 5, hue: '#8fd0ff' },
  { left: '62%', top: '48%', size: 3, hue: '#7ef0d0' },
];

/**
 * The abyssopelagic zone — a dark expanse the travelling submersible drifts
 * through (see Submersible), now dotted with distant, pulsing bioluminescent
 * creatures so the space reads as living rather than empty. Text reveals on
 * enter; the lower line reveals once the craft has passed.
 */
export function AbyssDrift() {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      gsap.from(q('[data-abyss-reveal]'), {
        autoAlpha: 0,
        y: 30,
        duration: 1,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start: 'top 70%' },
      });

      gsap.from(q('[data-abyss-coda]'), {
        autoAlpha: 0,
        y: 24,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: q('[data-abyss-coda]')[0], start: 'top 82%' },
      });

      // Twinkle the distant creatures at staggered rhythms.
      q('[data-light]').forEach((light, i) => {
        gsap.to(light, {
          opacity: 0.15,
          scale: 0.6,
          duration: 1.4 + (i % 4) * 0.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.4,
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={rootRef}
      aria-label="The abyss"
      className="relative flex min-h-[120vh] flex-col items-center px-6 pt-[15vh] text-center"
    >
      {/* Distant bioluminescent creatures */}
      {LIGHTS.map((l, i) => (
        <span
          key={i}
          data-light
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            left: l.left,
            top: l.top,
            width: l.size,
            height: l.size,
            background: l.hue,
            boxShadow: `0 0 ${l.size * 2.5}px ${l.hue}`,
          }}
        />
      ))}

      <p
        data-abyss-reveal
        className="font-body text-sm uppercase tracking-[0.4em] text-bioluminescent/80"
      >
        4,000 m
      </p>
      <h2
        data-abyss-reveal
        className="mt-4 font-display text-5xl font-semibold text-foam sm:text-6xl"
      >
        The Abyss
      </h2>
      <p
        data-abyss-reveal
        className="mt-6 max-w-md font-body text-base leading-relaxed text-foam/70 sm:text-lg"
      >
        Under pressure that would crush a submarine, life persists — patient,
        luminous, and stranger than the surface ever imagines.
      </p>

      {/* Coda, lower in the section — revealed after the craft drifts past. */}
      <p
        data-abyss-coda
        className="mt-auto mb-[12vh] max-w-sm font-display text-2xl italic text-foam/60 sm:text-3xl"
      >
        Down here, a single meal can last a decade.
      </p>
    </section>
  );
}
