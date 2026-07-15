import { test, expect } from '@playwright/test';

/**
 * Scroll through the page at several key positions and capture screenshots.
 * These are verification aids (viewed by hand each milestone), not strict
 * visual-regression assertions.
 */

const POSITIONS = [0, 0.1, 0.25, 0.5, 0.75, 1];

test('scrolls through the descent and captures each depth', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  for (const pos of POSITIONS) {
    await page.evaluate((p) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, max * p);
    }, pos);
    // Allow scrub/scroll to settle.
    await page.waitForTimeout(600);
    await page.screenshot({ path: `tests/__screenshots__/scroll-${Math.round(pos * 100)}.png` });
  }

  // The progress bar should exist and be scaled near full at the bottom.
  const scale = await page.evaluate(() => {
    const bar = document.querySelector('[role="progressbar"] > div') as HTMLElement | null;
    if (!bar) return null;
    const m = new DOMMatrixReadOnly(getComputedStyle(bar).transform);
    return m.a; // scaleX
  });
  expect(scale).not.toBeNull();
  expect(scale as number).toBeGreaterThan(0.9);
});

test('closing "return to the surface" scrolls back to top', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

  await page.getByRole('button', { name: /return to the surface/i }).click();
  await page.waitForTimeout(2200); // allow the smooth scroll-to-top to finish
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test('no ScrollTrigger leaks across repeated resizes', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const count = () =>
    page.evaluate(() => {
      const st = (window as unknown as { __ScrollTrigger?: { getAll(): unknown[] } }).__ScrollTrigger;
      return st ? st.getAll().length : -1;
    });

  const baseline = await count();
  expect(baseline, 'ScrollTrigger dev handle should be exposed').toBeGreaterThan(0);

  for (const [w, h] of [
    [1024, 768],
    [768, 1024],
    [1440, 900],
    [1280, 800],
  ] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(300);
  }

  const after = await count();
  expect(after, `triggers grew from ${baseline} to ${after} — leak on resize`).toBe(baseline);
});

test('reduced-motion: no console errors and content is present', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Into the Deep' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'You have reached the bottom of the world.' }),
  ).toBeAttached();

  // Pinned-beats fallback: all beats must be readable (not clipped) when static.
  for (const title of ['The Twilight Zone', 'The Oxygen Minimum', 'Where Light Is Made']) {
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  }
  await page.getByRole('heading', { name: 'Where Light Is Made' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'tests/__screenshots__/reduced-motion-beats.png' });

  // Horizontal-reef fallback: creature panels stack and are reachable.
  await expect(page.getByRole('heading', { name: 'Life at the Bottom' })).toBeVisible();
  for (const creature of ['Anglerfish', 'Snailfish', 'Giant Isopod']) {
    await expect(page.getByRole('heading', { name: creature })).toBeVisible();
  }

  expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0);
  await context.close();
});
