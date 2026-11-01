# Playwright + TypeScript E2E Framework

![Playwright Tests](https://github.com/spandanpandey1809/playwright-typescript-e2e-framework/actions/workflows/playwright.yml/badge.svg)

UI and API test automation for an e-commerce site with **Playwright** and **TypeScript**, run on every push and nightly in GitHub Actions.

Part of my test automation portfolio, with [restassured-selenium-testng-framework](https://github.com/spandanpandey1809/restassured-selenium-testng-framework) (Java web/API) and [appium-testng-mobile-framework](https://github.com/spandanpandey1809/appium-testng-mobile-framework) (Android).

| Layer | Tools |
| --- | --- |
| UI testing | Playwright Test, Page Object Model, web-first assertions, auto-waiting |
| API testing | Playwright `APIRequestContext`, typed service layer |
| Test design | Custom fixtures, tags (`@smoke`), soft assertions, data-driven tests |
| Reporting | Playwright HTML report with trace, screenshot and video on failure |
| CI/CD | GitHub Actions: push, pull request, nightly schedule |
| Language | TypeScript (strict mode), Node.js 22 |

## Application under test

[Automation Exercise](https://automationexercise.com), a public practice store with a web UI and a [public API](https://automationexercise.com/api_list).

## Project structure

```
src/
├── api/StoreApi.ts        # service layer: one method per endpoint, returns HTTP status + parsed body
├── api/types.ts           # typed response models
├── fixtures/test.ts       # custom fixtures: page objects, API client, ad blocking, throwaway users
├── fixtures/auth.ts       # logged-in tests: one account + saved session (storageState) per worker
├── pages/                 # Page Objects: Home, Products, Product details, Login, Signup, Cart, Checkout
├── utils/userFactory.ts   # unique test users, overridable per scenario
└── utils/price.ts         # "Rs. 1500" <-> 1500, so tests can do arithmetic on prices
tests/
├── api/                   # API specs (no browser)
└── ui/                    # browser specs; ui/logged-in/ start from a saved session
playwright.config.ts       # "api" and "chromium" projects, retries, trace/video settings
```

## Test coverage

| Area | Scenarios |
| --- | --- |
| Products API | Catalogue fields and price format, unique ids, unsupported method (405) |
| Brands API | Every product's brand exists in the brands list, unsupported method (405) |
| Search API | Data-driven search terms, missing parameter (400) |
| Account API | Create, read, verify login, delete; duplicate email, wrong password, missing parameter, unsupported method |
| Products UI | Home page, catalogue count matches the API, search results match the search API, product details match API data |
| Login and signup UI | Log in and out, invalid logins (data-driven), full signup and account deletion, duplicate email |
| Cart UI | Add from catalogue (prices and totals match the API), quantity from product page, remove to empty cart |
| Saved session | Starts logged in, session reused in a new browser context, order placed without a login step |
| Checkout UI | Guest is asked to log in; logged-in user: addresses from the account, total = price x quantity, payment, order confirmation |

## How to run

Requires Node.js 18+.

```bash
npm ci
npx playwright install chromium

npm test                  # everything
npm run test:api          # API only
npm run test:ui           # browser only
npx playwright test --grep @smoke
npm run test:headed       # watch the browser
npm run report            # open the HTML report
```

## Design decisions

- **UI checked against the API:** UI tests read the expected data from the API, so they never hard-code product names or counts that change.
- **Ad blocking in a fixture:** the site's Google ads open full-screen pop-ups mid-test. The `page` fixture aborts ad and tracker requests, so every test gets it automatically and runs faster.
- **A throwaway user per test:** the `newUser` fixture creates an account through the API before the test and deletes it afterwards, even if the test fails. No shared accounts, so tests stay independent and parallel-safe.
- **Log in once per worker, not once per test:** `fixtures/auth.ts` creates an account per parallel worker, logs in through the UI once and saves the cookies with `storageState`. Tests in `ui/logged-in/` start already logged in. It is one account per worker rather than one for the whole run because the site keeps the cart on the server, so parallel tests sharing a user would see each other's cart. These tests never click Logout, which would end the shared session.
- **Clicks that work like a user's:** hovering a product card slides an overlay over its "Add to cart" link, so the page object hovers and clicks the overlay's button instead of forcing a click.
- **`data-qa` as the test id:** `testIdAttribute` is set to `data-qa`, the attribute the site's forms already use, so `getByTestId()` works without extra markup.
- **Status in the body:** the API always returns HTTP 200 with the real status in `responseCode`, and labels JSON as `text/html`. The service layer parses the body itself and tests assert on `responseCode`.
