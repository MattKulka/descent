import { useCallback, useRef } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { DEPTH_LAYERS, STATIC_PROGRESS, layerOpacity, lightOpacity } from '../lib/depth';

type Props = {
  /** When true, the gradient holds a representative static state (no scroll binding). */
  reducedMotion: boolean;
};

/**
 * Fixed, full-viewport background that shifts continuously through the depth
 * palette as the page scrolls. Only opacity is animated (GPU-composited).
 * Under reduced motion it renders one representative static state.
 */
export function DepthGradient({ reducedMotion }: Props) {
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lightRef = useRef<HTMLDivElement>(null);

  const handleProgress = useCallback(
    (progress: number) => {
      layerRefs.current.forEach((el, i) => {
        if (el) el.style.opacity = String(layerOpacity(i, progress));
      });
      if (lightRef.current) lightRef.current.style.opacity = String(lightOpacity(progress));
    },
    [],
  );

  // Always register (harmless extra ScrollTrigger); ignore updates when static.
  useScrollProgress(reducedMotion ? NOOP : handleProgress);

  const initial = (i: number) =>
    reducedMotion ? layerOpacity(i, STATIC_PROGRESS) : i === 0 ? 1 : 0;

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      {DEPTH_LAYERS.map((bg, i) => (
        <div
          key={i}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ backgroundImage: bg, opacity: initial(i) }}
        />
      ))}
      {/* Surface light glow from the top — fades with depth. */}
      <div
        ref={lightRef}
        className="absolute inset-0"
        style={{
          opacity: reducedMotion ? lightOpacity(STATIC_PROGRESS) : 1,
          background:
            'radial-gradient(120% 60% at 50% -10%, rgba(234,246,251,0.35), rgba(234,246,251,0) 60%)',
        }}
      />
    </div>
  );
}

const NOOP = () => {};
