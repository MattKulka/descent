import { useCallback, useRef } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

// Control points mapping page-scroll progress → depth, tuned so the readout
// roughly agrees with each zone's on-screen depth (the sections don't map to
// depth linearly). Interpolated piecewise.
const STOPS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.12, 120],
  [0.25, 600],
  [0.44, 1000],
  [0.56, 1600],
  [0.66, 4000],
  [0.74, 5200],
  [0.82, 6800],
  [0.92, 9200],
  [1, 10935], // Challenger Deep
];

function depthAt(progress: number): number {
  for (let i = 1; i < STOPS.length; i += 1) {
    const [p1, d1] = STOPS[i];
    if (progress <= p1) {
      const [p0, d0] = STOPS[i - 1];
      const t = (progress - p0) / (p1 - p0 || 1);
      return d0 + (d1 - d0) * t;
    }
  }
  return STOPS[STOPS.length - 1][1];
}

/**
 * A minimal instrument-style depth readout, fixed to the corner, that ticks
 * from 0 to the bottom of the ocean as you scroll. Purely a text update (no
 * motion), so it is shown in both the animated and reduced-motion paths.
 */
export function DepthHUD() {
  const valueRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const handleProgress = useCallback((progress: number) => {
    const metres = Math.round(depthAt(progress) / 5) * 5;
    if (valueRef.current) valueRef.current.textContent = metres.toLocaleString('en-US');
    if (barRef.current) barRef.current.style.transform = `scaleY(${progress})`;
  }, []);
  useScrollProgress(handleProgress);

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-40 flex items-end gap-3 text-foam/70">
      <span className="relative block h-16 w-px bg-foam/20" aria-hidden="true">
        <span
          ref={barRef}
          className="absolute inset-x-0 top-0 h-full origin-top bg-bioluminescent/80"
          style={{ transform: 'scaleY(0)' }}
        />
      </span>
      <span className="font-body text-[11px] uppercase leading-none tracking-[0.25em]">
        <span ref={valueRef} className="text-sm font-medium tabular-nums text-foam">
          0
        </span>{' '}
        m
      </span>
    </div>
  );
}
