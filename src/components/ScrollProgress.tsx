import { useCallback, useRef } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

/**
 * Fixed scroll-progress indicator across the top of the viewport.
 * Animated via transform: scaleX only (compositor-friendly, no layout).
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  const handleProgress = useCallback((progress: number) => {
    const el = barRef.current;
    if (el) el.style.transform = `scaleX(${progress})`;
  }, []);

  useScrollProgress(handleProgress);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1"
      role="progressbar"
      aria-label="Reading progress"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-bioluminescent/90 shadow-[0_0_12px_rgba(126,240,208,0.7)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
