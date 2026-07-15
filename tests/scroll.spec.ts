import { test, expect } from '@playwright/test';

/**
 * Scroll through the page at several key positions and capture screenshots.
 * These are verification aids (viewed by hand each milestone), not strict
 * visual-regression assertions.
 */

const POSITIONS = [0, 0.25, 0.5, 0.75, 1];

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

test('reduced-motion: no console errors and content is present', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Surface' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hadal' })).toBeAttached();

  expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0);
  await context.close();
});
