import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';

type Props = { reducedMotion: boolean };

const clamp01 = gsap.utils.clamp(0, 1);
const lerp = gsap.utils.interpolate;
const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

type Kind = 'school' | 'jelly' | 'whale';
type Cfg = {
  id: string;
  kind: Kind;
  band: [number, number];
  top: string;
  xFrom: number; // vw
  xTo: number; // vw
  opacity: number;
};

// Depth-anchored ambient life. Each creature drifts across the screen while its
// scroll "band" is active (page-progress driven, so it is robust to the pinned
// sections it passes behind). Idle animations run continuously on top.
const CREATURES: Cfg[] = [
  { id: 'school', kind: 'school', band: [0.05, 0.31], top: '19vh', xFrom: -28, xTo: 118, opacity: 0.55 },
  { id: 'jelly-a', kind: 'jelly', band: [0.25, 0.5], top: '30vh', xFrom: 78, xTo: 20, opacity: 0.8 },
  { id: 'jelly-b', kind: 'jelly', band: [0.29, 0.54], top: '58vh', xFrom: 18, xTo: 66, opacity: 0.7 },
  { id: 'jelly-c', kind: 'jelly', band: [0.33, 0.57], top: '44vh', xFrom: 58, xTo: 34, opacity: 0.72 },
  { id: 'whale', kind: 'whale', band: [0.42, 0.66], top: '36vh', xFrom: 118, xTo: -80, opacity: 0.24 },
];

/**
 * Ambient creatures that populate the water — a darting fish school near the
 * surface, pulsing jellyfish through the twilight, and a lone whale gliding by
 * in the midnight zone. Rendered behind content (negative z). Omitted under
 * reduced motion (purely decorative movement).
 */
export function Creatures({ reducedMotion }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const wrappers = gsap.utils.toArray<HTMLElement>(q('[data-creature]'));

      const apply = (progress: number) => {
        const vw = window.innerWidth / 100;
        wrappers.forEach((el, i) => {
          const c = CREATURES[i];
          const local = clamp01((progress - c.band[0]) / (c.band[1] - c.band[0]));
          const op = c.opacity * Math.min(ramp(local, 0, 0.14), 1 - ramp(local, 0.82, 1));
          gsap.set(el, { x: lerp(c.xFrom, c.xTo, local) * vw, autoAlpha: op });
        });
      };

      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      apply(st.progress);

      // --- Idle life ---------------------------------------------------
      q('[data-fish]').forEach((f, i) => {
        gsap.to(f, {
          rotation: i % 2 ? 5 : -5,
          y: i % 3 ? 6 : -6,
          transformOrigin: 'right center',
          duration: 0.5 + (i % 3) * 0.18,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.12,
        });
      });
      q('[data-bell]').forEach((b, i) => {
        gsap.to(b, {
          scaleY: 0.82,
          scaleX: 1.07,
          transformOrigin: 'center top',
          duration: 1.5 + (i % 3) * 0.35,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.5,
        });
      });
      q('[data-tentacles]').forEach((t, i) => {
        gsap.to(t, {
          rotation: i % 2 ? 4 : -4,
          transformOrigin: 'center top',
          duration: 2 + (i % 2) * 0.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
      q('[data-fluke]').forEach((fl) => {
        gsap.to(fl, {
          rotation: 9,
          transformOrigin: 'right center',
          duration: 2.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
      q('[data-whalebody]').forEach((wb) => {
        gsap.to(wb, { y: 12, duration: 3.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: -6 }}
    >
      {CREATURES.map((c) => (
        <div
          key={c.id}
          data-creature
          className="absolute left-0"
          style={{ top: c.top, opacity: 0 }}
        >
          {c.kind === 'school' && <FishSchool />}
          {c.kind === 'jelly' && <Jellyfish />}
          {c.kind === 'whale' && <Whale />}
        </div>
      ))}
    </div>
  );
}

// A loose cluster of small darting fish.
const FISH_POS = [
  [24, 40],
  [70, 20],
  [58, 66],
  [104, 46],
  [140, 26],
  [128, 74],
  [92, 96],
];

function FishSchool() {
  return (
    <svg viewBox="0 0 190 120" className="h-24 w-40 sm:h-28 sm:w-48" aria-hidden="true">
      {FISH_POS.map(([x, y], i) => (
        <g key={i} data-fish transform={`translate(${x} ${y})`}>
          <path d="M-11,0 Q-2,-5 11,0 Q-2,5 -11,0 Z" fill="#2b6c99" />
          <path d="M-11,0 L-18,-4 L-15,0 L-18,4 Z" fill="#2b6c99" />
        </g>
      ))}
    </svg>
  );
}

function Jellyfish() {
  return (
    <svg viewBox="-32 -22 64 96" className="h-24 w-16 sm:h-28 sm:w-20" aria-hidden="true">
      <g data-bell>
        <path
          d="M-24,4 C-24,-20 24,-20 24,4 C12,10 -12,10 -24,4 Z"
          fill="rgba(126,240,208,0.14)"
          stroke="#7ef0d0"
          strokeWidth="1.5"
        />
      </g>
      <g data-tentacles stroke="#7ef0d0" strokeWidth="1.2" fill="none" opacity="0.8">
        <path d="M-16,6 q-3,20 2,44" />
        <path d="M-7,8 q2,22 -2,46" />
        <path d="M0,8 q-2,24 1,48" />
        <path d="M7,8 q3,22 -1,46" />
        <path d="M16,6 q4,20 -2,44" />
      </g>
    </svg>
  );
}

function Whale() {
  return (
    <svg
      viewBox="-175 -62 350 132"
      className="h-auto w-[62vw] max-w-[860px]"
      aria-hidden="true"
    >
      <g data-whalebody fill="#12385c">
        {/* fluke (tail) */}
        <path data-fluke d="M-130,2 L-170,-26 L-150,2 L-170,30 Z" />
        {/* body */}
        <path d="M-132,4 C-90,-36 60,-42 122,-16 C140,-9 140,13 122,19 C60,42 -90,36 -132,10 Z" />
        {/* pectoral fin */}
        <path d="M18,22 C10,44 40,50 54,30 C40,34 28,30 18,22 Z" />
        {/* subtle top rim light */}
        <path
          d="M-120,-2 C-80,-33 55,-39 116,-15"
          fill="none"
          stroke="#4a7ea0"
          strokeWidth="1.5"
          opacity="0.5"
        />
        {/* eye */}
        <circle cx="104" cy="2" r="2.6" fill="#02101f" />
      </g>
    </svg>
  );
}
