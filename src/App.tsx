import { ScrollProgress } from './components/ScrollProgress';
import { DepthGradient } from './components/DepthGradient';
import { MarineSnow } from './components/MarineSnow';
import { Creatures } from './components/Creatures';
import { CursorGlow } from './components/CursorGlow';
import { DepthHUD } from './components/DepthHUD';
import { Submersible } from './components/Submersible';
import { Hero } from './scenes/Hero';
import { PinnedBeats } from './scenes/PinnedBeats';
import { DescentPath } from './scenes/DescentPath';
import { AbyssDrift } from './scenes/AbyssDrift';
import { HorizontalReef } from './scenes/HorizontalReef';
import { Closing } from './scenes/Closing';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  useSmoothScroll(!prefersReducedMotion);

  return (
    <>
      <DepthGradient reducedMotion={prefersReducedMotion} />
      <MarineSnow reducedMotion={prefersReducedMotion} />
      <Creatures reducedMotion={prefersReducedMotion} />
      <Submersible reducedMotion={prefersReducedMotion} journeySelector="[data-journey]" />
      <CursorGlow reducedMotion={prefersReducedMotion} />
      <ScrollProgress />
      <DepthHUD />
      <main>
        <Hero />
        <PinnedBeats />
        {/* The submersible hands off across this span (descent trail → abyss). */}
        <div data-journey>
          <DescentPath />
          <AbyssDrift />
        </div>
        <HorizontalReef />
        <Closing />
      </main>
    </>
  );
}
