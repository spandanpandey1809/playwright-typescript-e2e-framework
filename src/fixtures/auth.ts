import fs from 'fs';
import path from 'path';
import { request as apiRequest } from '@playwright/test';
import { StoreApi } from '../api/StoreApi';
import { LoginPage } from '../pages/LoginPage';
import { buildUser, type TestUser } from '../utils/userFactory';
import { isBlockedHost, test as base } from './test';

/**
 * Logged-in tests without logging in every time.
 *
 * Each parallel worker gets its own account: it is created through the API,
 * logged in once through the UI, and the browser's cookies are saved with
 * storageState(). Every test in that worker then starts already logged in.
 * One account per worker (not one for the whole run) because the site keeps
 * the cart on the server, so two parallel tests sharing a user would see each
 * other's cart.
 *
 * Tests using this fixture must not click Logout: that ends the saved session
 * on the server for every later test in the worker.
 */
type WorkerFixtures = {
  workerAccount: TestUser;
  workerStorageState: string;
};

type TestFixtures = {
  /** The logged-in account for this test (shared by tests in the same worker). */
  account: TestUser;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Every context in a test using this file starts from the saved, logged-in state
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  account: ({ workerAccount }, use) => use(workerAccount),

  workerAccount: [
    async ({}, use, workerInfo) => {
      const context = await apiRequest.newContext({ baseURL: workerInfo.project.use.baseURL });
      const api = new StoreApi(context);
      const user = buildUser({ name: `PW Worker ${workerInfo.parallelIndex}` });

      const { body } = await api.createAccount(user);
      if (body.responseCode !== 201) throw new Error(`Could not create worker user: ${JSON.stringify(body)}`);

      await use(user);

      await api.deleteAccountQuietly(user.email, user.password);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  workerStorageState: [
    async ({ browser, playwright, workerAccount }, use, workerInfo) => {
      // The config's testIdAttribute is only applied inside tests, not in worker fixtures,
      // so set it here before the page objects call getByTestId()
      playwright.selectors.setTestIdAttribute(workerInfo.project.use.testIdAttribute ?? 'data-testid');

      const file = path.join(workerInfo.project.outputDir, '.auth', `worker-${workerInfo.parallelIndex}.json`);
      fs.mkdirSync(path.dirname(file), { recursive: true });

      // A clean context (no saved state yet) just for logging in once
      const context = await browser.newContext({ baseURL: workerInfo.project.use.baseURL, storageState: undefined });
      const page = await context.newPage();
      await page.route(isBlockedHost, (route) => route.abort());

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(workerAccount.email, workerAccount.password);
      await loginPage.loggedInAs.waitFor();

      await context.storageState({ path: file });
      await context.close();

      await use(file);
    },
    { scope: 'worker' },
  ],
});

export { expect } from './test';
