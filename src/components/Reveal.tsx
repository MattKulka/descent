import { useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type Props = {
  children: ReactNode;
  className?: string;
  /** Element to render as (default div). */
  as?: ElementType;
  /** When set, staggers the reveal of direct children instead of the element. */
  stagger?: number;
  /** Vertical travel distance in px. */
  y?: number;
};

/**
 * Reveal-on-enter wrapper: fades/rises content in when it scrolls into view.
 * With `stagger`, animates the element's direct children in sequence.
 * Reduced motion shows everything immediately (no transform, no trigger).
 */
export function Reveal({ children, className, as, stagger, y = 30 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const Tag = (as ?? 'div') as ElementType;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger ? Array.from(el.children) : el;

    if (prefersReducedMotion) {
      gsap.set(targets, { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion, stagger, y]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
