import { test as base } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage, PaymentPage } from '../pages/CheckoutPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductsPage } from '../pages/ProductsPage';
import { SignupPage } from '../pages/SignupPage';
import { StoreApi } from '../api/StoreApi';
import { buildUser, type TestUser } from '../utils/userFactory';

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

export const isBlockedHost = (url: URL) => BLOCKED_HOSTS.some((host) => url.hostname.endsWith(host));

type Fixtures = {
  homePage: HomePage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  api: StoreApi;
  /** A fresh account created through the API, deleted again after the test. */
  newUser: TestUser;
};

export const test = base.extend<Fixtures>({
  // Overrides the built-in page fixture, so every UI test gets ad blocking for free
  page: async ({ page }, use) => {
    await page.route(isBlockedHost, (route) => route.abort());
    await use(page);
  },
  homePage: async ({ page }, use) => use(new HomePage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
  api: async ({ request }, use) => use(new StoreApi(request)),

  newUser: async ({ api }, use) => {
    const user = buildUser();
    const { body } = await api.createAccount(user);
    if (body.responseCode !== 201) {
      throw new Error(`Could not create test user: ${JSON.stringify(body)}`);
    }
    await use(user);
    // Teardown runs even when the test fails; ignore "not found" if the test deleted it
    await api.deleteAccount(user.email, user.password);
  },
});

export { expect } from '@playwright/test';
