import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/**
 * The abyssopelagic zone — a tall, near-empty dark expanse the travelling
 * submersible drifts through (see Submersible). Sparse text reveals on enter.
 */
export function AbyssDrift() {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(gsap.utils.toArray('[data-abyss-reveal]'), {
        autoAlpha: 0,
        y: 30,
        duration: 1,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start: 'top 70%' },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={rootRef}
      aria-label="The abyss"
      className="relative flex min-h-[140vh] flex-col items-center px-6 pt-[18vh] text-center"
    >
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
    </section>
  );
}
