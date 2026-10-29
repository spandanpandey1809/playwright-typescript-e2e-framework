import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { StoreApi } from '../api/StoreApi';

/**
 * Third-party ad and tracking hosts. The demo site loads Google ads that open
 * full-screen "vignette" pop-ups mid-test and slow every page, so they are
 * blocked at the network layer before any test code runs.
 */
const BLOCKED_HOSTS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'google-analytics.com',
  'googletagmanager.com',
  'adservice.google.com',
  'fundingchoicesmessages.google.com',
];

type Fixtures = {
  homePage: HomePage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  api: StoreApi;
};

export const test = base.extend<Fixtures>({
  // Overrides the built-in page fixture, so every UI test gets ad blocking for free
  page: async ({ page }, use) => {
    await page.route(
      (url) => BLOCKED_HOSTS.some((host) => url.hostname.endsWith(host)),
      (route) => route.abort(),
    );
    await use(page);
  },
  homePage: async ({ page }, use) => use(new HomePage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  api: async ({ request }, use) => use(new StoreApi(request)),
});

export { expect } from '@playwright/test';
