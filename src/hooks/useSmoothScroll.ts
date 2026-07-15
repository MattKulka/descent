import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';

/**
 * Wire Lenis smooth scroll into GSAP's ticker and keep ScrollTrigger in sync.
 *
 * Lenis 1.x scrolls the real window, so ScrollTrigger reads scroll position
 * normally — we just drive Lenis from gsap.ticker and call ScrollTrigger.update
 * on every Lenis scroll event. No scrollerProxy needed.
 *
 * When `enabled` is false (reduced motion), we skip Lenis entirely and use
 * native scrolling. ScrollTrigger still works against native scroll.
 */
export function useSmoothScroll(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => {
      // gsap.ticker time is in seconds; Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Let all scene ScrollTriggers register, then measure once.
    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [enabled]);
}
