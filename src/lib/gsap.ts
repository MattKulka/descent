// Single registration site for GSAP + ScrollTrigger.
// Import { gsap, ScrollTrigger } from here everywhere else so the plugin is
// only registered once and tree-shaking stays predictable.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
