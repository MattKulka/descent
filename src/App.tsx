import { ScrollProgress } from './components/ScrollProgress';
import { Hero } from './scenes/Hero';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

// Placeholder zones below the hero establish scroll height and the depth
// palette. Real scenes replace these section-by-section in M2–M5.
const ZONES = [
  { name: 'Twilight', bg: 'bg-depth-twilight', text: 'text-foam', depth: '200 m' },
  { name: 'Midnight', bg: 'bg-depth-midnight', text: 'text-foam', depth: '1,000 m' },
  { name: 'Abyss', bg: 'bg-depth-abyss', text: 'text-foam', depth: '4,000 m' },
  { name: 'Hadal', bg: 'bg-depth-hadal', text: 'text-foam', depth: '6,000 m+' },
] as const;

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  useSmoothScroll(!prefersReducedMotion);

  return (
    <>
      <ScrollProgress />
      <main>
        <Hero />
        {ZONES.map((zone) => (
          <section
            key={zone.name}
            className={`flex min-h-screen flex-col items-center justify-center ${zone.bg} ${zone.text}`}
          >
            <p className="font-body text-sm uppercase tracking-[0.4em] opacity-70">{zone.depth}</p>
            <h2 className="font-display text-6xl font-semibold tracking-tight">{zone.name}</h2>
          </section>
        ))}
      </main>
    </>
  );
}
