import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

type Props = { reducedMotion: boolean };

const POOL = 28;

/**
 * Interactive bioluminescence: moving the pointer stirs up a trail of glowing
 * motes, like disturbing plankton in the water. A fixed pool of spans is
 * recycled (no allocation per move) and blended with `screen` so the glow only
 * really shows against the dark deep. Disabled under reduced motion.
 */
export function CursorGlow({ reducedMotion }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;
    // Skip for coarse pointers (touch) where there's no hover to trail.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dots = Array.from(root.children) as HTMLElement[];
    let idx = 0;
    let last = 0;

    const spawn = (x: number, y: number) => {
      const now = performance.now();
      if (now - last < 28) return; // throttle emission
      last = now;
      const el = dots[idx];
      idx = (idx + 1) % dots.length;
      gsap.killTweensOf(el);
      gsap.set(el, {
        x: x + gsap.utils.random(-10, 10),
        y: y + gsap.utils.random(-10, 10),
        scale: gsap.utils.random(0.4, 1),
        opacity: gsap.utils.random(0.5, 0.95),
      });
      gsap.to(el, {
        scale: '+=1.3',
        opacity: 0,
        duration: gsap.utils.random(0.7, 1.3),
        ease: 'power2.out',
      });
    };

    const onMove = (e: PointerEvent) => spawn(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
      style={{ mixBlendMode: 'screen' }}
    >
      {Array.from({ length: POOL }).map((_, i) => (
        <span
          key={i}
          className="absolute -ml-2 -mt-2 h-4 w-4 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(126,240,208,0.95), rgba(126,240,208,0) 68%)',
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
