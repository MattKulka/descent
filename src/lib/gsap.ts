// Single registration site for GSAP + ScrollTrigger.
// Import { gsap, ScrollTrigger } from here everywhere else so the plugin is
// only registered once and tree-shaking stays predictable.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Dev-only handle so E2E tests can assert no ScrollTrigger leaks across resize.
if (import.meta.env.DEV) {
  (window as unknown as { __ScrollTrigger?: typeof ScrollTrigger }).__ScrollTrigger = ScrollTrigger;
}

export { gsap, ScrollTrigger };
