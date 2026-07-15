import { gsap } from './gsap';

/**
 * Depth-zone background layers, surface → hadal. Rendered as stacked
 * full-screen elements; we cross-fade their *opacity* (compositor-friendly,
 * no per-frame repaint) rather than mutating a gradient string each frame.
 */
export const DEPTH_LAYERS: readonly string[] = [
  'linear-gradient(to bottom, #4cc9e8, #2ea6cc)', // surface / epipelagic
  'linear-gradient(to bottom, #1b7fa8, #0f5f80)', // twilight / mesopelagic
  'linear-gradient(to bottom, #0a3a5c, #072a44)', // midnight / bathypelagic
  'linear-gradient(to bottom, #04162b, #030f1f)', // abyss / abyssopelagic
  'linear-gradient(to bottom, #030b18, #01060f)', // hadal trench
];

const clamp01 = gsap.utils.clamp(0, 1);
const LAST = DEPTH_LAYERS.length - 1;

/**
 * Opacity of layer `index` for overall scroll `progress` (0–1).
 * Layer 0 is always fully opaque (the base); each deeper layer fades in over
 * its own band, producing a continuous sequential cross-fade as you descend.
 */
export function layerOpacity(index: number, progress: number): number {
  if (index <= 0) return 1;
  const bandStart = (index - 1) / LAST;
  const bandEnd = index / LAST;
  return clamp01((progress - bandStart) / (bandEnd - bandStart));
}

/** Surface light / god-ray glow — fades out by the time we reach midnight. */
export function lightOpacity(progress: number): number {
  return clamp01(1 - progress * 2.2);
}

/** Representative static state used under prefers-reduced-motion. */
export const STATIC_PROGRESS = 0.5;
