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
  try {
    const response = await context.get('/api/brandsList', { timeout: 30_000 });
    const text = await response.text();
    try {
      JSON.parse(text);
    } catch {
      const title = /<title>(.*?)<\/title>/i.exec(text)?.[1] ?? 'no title';
      throw new Error(
        `Environment check failed: ${baseURL} returned an HTML page ("${title}") instead of the API. ` +
          'The site is unavailable or showing a bot check; re-run later. No tests were run.',
      );
    }
  } finally {
    await context.dispose();
  }
}
