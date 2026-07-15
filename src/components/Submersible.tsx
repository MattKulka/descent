import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';

const clamp01 = gsap.utils.clamp(0, 1);
const lerp = gsap.utils.interpolate;

/** Smooth 0→1 ramp used for entry/exit fades. */
const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

type Props = {
  reducedMotion: boolean;
  /** CSS selector for the element whose scroll span drives the journey. */
  journeySelector: string;
};

/**
 * A persistent hand-off element: a submersible that drifts down across the
 * descent-path → abyss boundary and morphs (cross-fades) into an anglerfish —
 * machine giving way to native life. Lives in one fixed overlay driven by a
 * single ScrollTrigger spanning both sections, so it reads as continuous
 * rather than each section owning its own isolated element.
 *
 * Rendered behind text content (negative z-index) as ambient depth.
 */
export function Submersible({ reducedMotion, journeySelector }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const craft = q('[data-craft]')[0] as HTMLElement;
      const subForm = q('[data-form="sub"]');
      const fishForm = q('[data-form="fish"]');

      gsap.set(craft, { xPercent: -50, yPercent: -50 });

      if (reducedMotion) {
        // The travelling craft is a purely decorative, motion-only element and
        // there is no valid static position for a fixed overlay across a long
        // page — so omit it entirely. The abyss narrative stands on its own.
        gsap.set(craft, { autoAlpha: 0 });
        return;
      }

      gsap.set(craft, { autoAlpha: 0 });
      gsap.set(subForm, { autoAlpha: 1 });
      gsap.set(fishForm, { autoAlpha: 0 });

      // Map overall PAGE scroll progress to a band derived from the journey
      // element's measured position. This avoids ScrollTrigger mis-measuring a
      // trigger that *contains* a pinned section (which collapses the span).
      let band = { start: 0.5, end: 0.92 };
      const measure = () => {
        const journey = document.querySelector(journeySelector) as HTMLElement | null;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (!journey || max <= 0) return;
        const top = journey.getBoundingClientRect().top + window.scrollY;
        const height = journey.getBoundingClientRect().height;
        const vh = window.innerHeight;
        // Craft is present from when the journey is ~half revealed until its
        // end is nearly gone — a slow travel across the descent-path → abyss span.
        band = {
          start: clamp01((top - vh * 0.5) / max),
          end: clamp01((top + height - vh * 0.55) / max),
        };
      };

      const apply = (progress: number) => {
        const local = clamp01((progress - band.start) / (band.end - band.start || 1));
        const vh = window.innerHeight;
        // Entry/exit fade so the craft doesn't hard-clip at the band edges.
        const opacity = Math.min(ramp(local, 0, 0.08), 1 - ramp(local, 0.86, 1));
        gsap.set(craft, {
          y: lerp(-vh * 0.42, vh * 0.42, local),
          rotation: lerp(-10, 10, local),
          autoAlpha: opacity,
        });
        // Morph/hand-off: submersible → anglerfish across the section boundary
        // (local ~0.6–0.75), i.e. as we settle into the abyss.
        const fish = ramp(local, 0.6, 0.75);
        gsap.set(fishForm, { autoAlpha: fish });
        gsap.set(subForm, { autoAlpha: 1 - fish });
      };

      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onRefresh: (self) => {
          measure();
          apply(self.progress);
        },
        onUpdate: (self) => apply(self.progress),
      });
      measure();
      apply(st.progress);
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion, journeySelector]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -5 }}
    >
      <div data-craft className="absolute left-1/2 top-1/2">
        <svg
          viewBox="-100 -80 200 160"
          className="h-40 w-40 overflow-visible sm:h-56 sm:w-56"
        >
          {/* ---- Submersible ---- */}
          <g data-form="sub">
            {/* head-lamp beam */}
            <path d="M52,-4 L150,-40 L150,40 L52,4 Z" fill="#eaf6fb" opacity="0.10" />
            <ellipse cx="0" cy="0" rx="48" ry="26" fill="#0a3a5c" stroke="#7ef0d0" strokeWidth="2" />
            <circle cx="34" cy="0" r="14" fill="#04162b" stroke="#7ef0d0" strokeWidth="2" />
            <circle cx="34" cy="0" r="6" fill="#7ef0d0" />
            <path d="M-40,-18 L-64,-34 L-52,-10 Z" fill="#0a3a5c" stroke="#7ef0d0" strokeWidth="1.5" />
            <path d="M-40,18 L-64,34 L-52,10 Z" fill="#0a3a5c" stroke="#7ef0d0" strokeWidth="1.5" />
            <line x1="-48" y1="0" x2="-70" y2="0" stroke="#7ef0d0" strokeWidth="2" />
          </g>

          {/* ---- Anglerfish ---- */}
          <g data-form="fish">
            {/* lure stalk + glowing bulb */}
            <path d="M30,-14 q26,-40 6,-58" fill="none" stroke="#2ea6cc" strokeWidth="2" />
            <circle cx="36" cy="-74" r="9" fill="#7ef0d0" opacity="0.35" />
            <circle cx="36" cy="-74" r="4.5" fill="#eaf6fb" />
            {/* body */}
            <path
              d="M40,0 C34,-30 -20,-34 -54,-14 C-70,-6 -70,6 -54,14 C-20,34 34,30 40,0 Z"
              fill="#04162b"
              stroke="#2ea6cc"
              strokeWidth="2"
            />
            {/* tail */}
            <path d="M-54,0 L-84,-20 L-78,0 L-84,20 Z" fill="#04162b" stroke="#2ea6cc" strokeWidth="1.5" />
            {/* eye */}
            <circle cx="20" cy="-6" r="4" fill="#eaf6fb" />
            {/* jaw with teeth */}
            <path d="M40,2 L8,20 L14,10 L6,14 L12,6 L4,8 Z" fill="#04162b" stroke="#2ea6cc" strokeWidth="1.2" />
          </g>
        </svg>
      </div>
    </div>
  );
}
