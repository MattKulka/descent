import { ScrollProgress } from './components/ScrollProgress';
import { DepthGradient } from './components/DepthGradient';
import { Hero } from './scenes/Hero';
import { PinnedBeats } from './scenes/PinnedBeats';
import { DescentPath } from './scenes/DescentPath';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

// Transparent placeholder zones (global DepthGradient shows through) hold
// scroll height until the abyss/hadal scenes land in M4–M5.
const ZONES = [
  { name: 'Abyss', depth: '4,000 m' },
  { name: 'Hadal', depth: '6,000 m+' },
] as const;

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  useSmoothScroll(!prefersReducedMotion);

  return (
    <>
      <DepthGradient reducedMotion={prefersReducedMotion} />
      <ScrollProgress />
      <main>
        <Hero />
        <PinnedBeats />
        <DescentPath />
        {ZONES.map((zone) => (
          <section
            key={zone.name}
            className="flex min-h-screen flex-col items-center justify-center text-foam"
          >
            <p className="font-body text-sm uppercase tracking-[0.4em] opacity-70">{zone.depth}</p>
            <h2 className="font-display text-6xl font-semibold tracking-tight">{zone.name}</h2>
          </section>
        ))}
      </main>
    </>
  );
}
