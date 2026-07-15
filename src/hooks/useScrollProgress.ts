import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';

/**
 * Report overall page scroll progress (0 → 1) via a callback, driven by a
 * single document-spanning ScrollTrigger. Callback-based (not React state) so
 * consumers can update the DOM imperatively every frame without re-rendering.
 */
export function useScrollProgress(onProgress: (progress: number) => void): void {
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => onProgress(self.progress),
        onRefresh: (self) => onProgress(self.progress),
      });
    });
    return () => ctx.revert();
  }, [onProgress]);
}
