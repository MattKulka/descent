import type Lenis from 'lenis';

// Holds the active Lenis instance (set by useSmoothScroll) so UI like the
// scroll-to-top button can drive smooth scrolling without prop-drilling it.
let activeLenis: Lenis | null = null;

export function setActiveLenis(lenis: Lenis | null): void {
  activeLenis = lenis;
}

/**
 * Scroll back to the top. Uses Lenis when smooth scroll is active; otherwise
 * (e.g. under reduced motion, where Lenis is disabled) jumps instantly.
 */
export function scrollToTop(): void {
  if (activeLenis) {
    activeLenis.scrollTo(0, { duration: 1.6 });
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}
