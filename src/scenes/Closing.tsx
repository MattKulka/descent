import { Reveal } from '../components/Reveal';
import { scrollToTop } from '../lib/scroll';

/**
 * Closing scene: the trench floor, a reflective sign-off, and a clear call to
 * action that carries the reader back to the surface (scroll-to-top).
 */
export function Closing() {
  return (
    <section
      aria-label="The bottom of the descent"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <Reveal stagger={0.15} className="flex flex-col items-center">
        <p className="font-body text-xs uppercase tracking-[0.5em] text-bioluminescent/80">
          10,935 m
        </p>
        <h2 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-tight text-foam sm:text-6xl">
          You have reached the bottom of the world.
        </h2>
        <p className="mt-8 max-w-md font-body text-base leading-relaxed text-foam/70 sm:text-lg">
          Seven vertical miles of ocean above you — and still, life glows in the
          dark. There is nowhere deeper to go but back toward the light.
        </p>

        <button
          type="button"
          onClick={scrollToTop}
          className="group mt-14 inline-flex items-center gap-3 rounded-full border border-bioluminescent/40 px-8 py-4 font-body text-sm uppercase tracking-[0.3em] text-foam transition-colors hover:bg-bioluminescent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bioluminescent"
        >
          Return to the surface
          <span aria-hidden="true" className="text-lg motion-safe:animate-ascent">
            ↑
          </span>
        </button>
      </Reveal>
    </section>
  );
}
