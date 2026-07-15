import { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useScrollProgress } from '../hooks/useScrollProgress';

type Props = { reducedMotion: boolean };

const COUNT = 46;

// Deterministic pseudo-random so the field is stable across renders (no CLS).
function rand(i: number, salt: number): number {
  const x = Math.sin(i * 97.13 + salt * 13.37) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: COUNT }, (_, i) => ({
  left: rand(i, 1) * 100,
  size: 1.2 + rand(i, 2) * 3.4,
  duration: 9 + rand(i, 3) * 12,
  startProgress: rand(i, 4), // where in its fall it begins at t=0
  drift: (rand(i, 5) - 0.5) * 44,
  opacity: 0.18 + rand(i, 6) * 0.5,
  swayDur: 3 + rand(i, 7) * 4,
}));

/**
 * Drifting "marine snow" — slow-falling bioluminescent motes that fill the deep
 * dark expanses with ambient life. The whole field fades in with depth so the
 * sunlit surface stays clean. Only transforms/opacity animate (GPU-composited).
 * Under reduced motion the motes are scattered statically (texture, no motion).
 */
export function MarineSnow({ reducedMotion }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Array<HTMLSpanElement | null>>([]);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      dotsRef.current.forEach((el, i) => {
        if (!el) return;
        const p = PARTICLES[i];
        // Continuous fall from just above the viewport to just below, looping.
        gsap.fromTo(
          el,
          { yPercent: -10 },
          {
            yPercent: 110,
            duration: p.duration,
            ease: 'none',
            repeat: -1,
            delay: -p.startProgress * p.duration,
          },
        );
        // Independent horizontal sway.
        gsap.to(el, {
          x: p.drift,
          duration: p.swayDur,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: -rand(i, 8) * p.swayDur,
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  const handleProgress = useCallback((progress: number) => {
    const el = rootRef.current;
    // Fade the field in over the first ~20% of the descent.
    if (el) el.style.opacity = String(Math.min(1, progress / 0.2));
  }, []);
  useScrollProgress(reducedMotion ? NOOP : handleProgress);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: -4, opacity: reducedMotion ? 0.5 : 0 }}
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          ref={(el) => {
            dotsRef.current[i] = el;
          }}
          className="absolute top-0 rounded-full bg-foam"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            transform: reducedMotion ? `translateY(${p.startProgress * 100}vh)` : undefined,
          }}
        />
      ))}
    </div>
  );
}

const NOOP = () => {};
