import { test, expect } from '../../../src/fixtures/auth';

test.describe('Saved login session', () => {
  test('starts logged in without visiting the login page', { tag: '@smoke' }, async ({ homePage, account }) => {
    await homePage.goto();
    await expect(homePage.loggedInAs).toHaveText(`Logged in as ${account.name}`);
  });

  test('a brand-new browser context reuses the session', async ({ browser, account, workerStorageState }, testInfo) => {
    // A second, separate browser context loaded from the same saved file
    const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, storageState: workerStorageState });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('#header')).toContainText(`Logged in as ${account.name}`);
    await context.close();
  });
});
