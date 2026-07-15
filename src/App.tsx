import { ScrollProgress } from './components/ScrollProgress';
import { DepthGradient } from './components/DepthGradient';
import { Submersible } from './components/Submersible';
import { Hero } from './scenes/Hero';
import { PinnedBeats } from './scenes/PinnedBeats';
import { DescentPath } from './scenes/DescentPath';
import { AbyssDrift } from './scenes/AbyssDrift';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  useSmoothScroll(!prefersReducedMotion);

  return (
    <>
      <DepthGradient reducedMotion={prefersReducedMotion} />
      <Submersible reducedMotion={prefersReducedMotion} journeySelector="[data-journey]" />
      <ScrollProgress />
      <main>
        <Hero />
        <PinnedBeats />
        {/* The submersible hands off across this span (descent trail → abyss). */}
        <div data-journey>
          <DescentPath />
          <AbyssDrift />
        </div>
        {/* Placeholder hadal zone until M5 replaces it. */}
        <section className="relative flex min-h-screen flex-col items-center justify-center text-foam">
          <p className="font-body text-sm uppercase tracking-[0.4em] opacity-70">6,000 m+</p>
          <h2 className="font-display text-6xl font-semibold tracking-tight">Hadal</h2>
        </section>
      </main>
    </>
  );
}
