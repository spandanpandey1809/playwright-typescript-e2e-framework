import { test, expect } from '../../src/fixtures/test';

/**
 * Visual regression on stable parts of the site. Screenshots differ slightly
 * between operating systems (fonts, anti-aliasing), so baselines are recorded
 * on Linux, the same as CI and the Docker image, and other platforms skip.
 */
test.describe('Visual regression', { tag: '@visual' }, () => {
  test.skip(process.platform !== 'linux', 'Baselines are recorded on Linux (CI and Docker)');

  test('login and signup forms look unchanged', async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(page.locator('.login-form')).toHaveScreenshot('login-form.png');
    await expect(page.locator('.signup-form')).toHaveScreenshot('signup-form.png');
  });

  test('login error state looks unchanged', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('nobody@example.com', 'wrong-password');
    await expect(loginPage.loginError).toBeVisible();
    // The typed email would make the screenshot depend on test data, so mask the inputs
    await expect(page.locator('.login-form')).toHaveScreenshot('login-form-error.png', {
      mask: [loginPage.loginEmail, loginPage.loginPassword],
    });
  });

  test('header navigation looks unchanged', async ({ homePage, page }) => {
    await homePage.goto();
    await expect(page.locator('#header .header-middle')).toHaveScreenshot('header.png');
  });
});
