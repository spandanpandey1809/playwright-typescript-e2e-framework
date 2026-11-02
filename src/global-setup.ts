import { request, type FullConfig } from '@playwright/test';

/**
 * Pre-flight check before any test runs.
 *
 * The demo site sometimes answers with a "One moment, please..." bot-check page
 * instead of the store, usually after many runs in a short time. Without this
 * check every test fails with a confusing locator or JSON error. This turns it
 * into one clear message, so a red run is not mistaken for a product bug.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL ?? 'https://automationexercise.com';
  const context = await request.newContext({ baseURL });
  const waits = [5_000, 15_000, 30_000]; // the site's overload page usually clears within a minute
  try {
    for (let attempt = 0; ; attempt++) {
      const text = await context
        .get('/api/brandsList', { timeout: 30_000 })
        .then((r) => r.text())
        .catch((e: Error) => `request failed: ${e.message}`);
      try {
        JSON.parse(text);
        return;
      } catch {
        if (attempt < waits.length) {
          await new Promise((resolve) => setTimeout(resolve, waits[attempt]));
          continue;
        }
        const title = /<title>(.*?)<\/title>/i.exec(text)?.[1] ?? /<h2>(.*?)<\/h2>/i.exec(text)?.[1] ?? 'no title';
        throw new Error(
          `Environment check failed after ${waits.length + 1} attempts: ${baseURL} returned "${title}" instead of the API. ` +
            'The site is unavailable or showing a bot check; re-run later. No tests were run.',
        );
      }
    }
  } finally {
    await context.dispose();
  }
}
