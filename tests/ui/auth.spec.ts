import { test, expect } from '../../src/fixtures/test';
import { buildUser } from '../../src/utils/userFactory';

test.describe('Login', () => {
  test('valid user can log in and log out', { tag: '@smoke' }, async ({ loginPage, newUser, page }) => {
    await loginPage.goto();
    await loginPage.login(newUser.email, newUser.password);

    await expect(loginPage.loggedInAs).toHaveText(`Logged in as ${newUser.name}`);

    await loginPage.logout();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.loggedInAs).toBeHidden();
  });

  const invalidLogins = [
    { scenario: 'wrong password', email: (e: string) => e, password: 'wrong-password' },
    { scenario: 'unknown email', email: () => buildUser().email, password: 'any-password' },
  ];

  for (const { scenario, email, password } of invalidLogins) {
    test(`login fails with ${scenario}`, async ({ loginPage, newUser }) => {
      await loginPage.goto();
      await loginPage.login(email(newUser.email), password);

      await expect(loginPage.loginError).toBeVisible();
      await expect(loginPage.loggedInAs).toBeHidden();
    });
  }
});

test.describe('Signup', () => {
  test('new user signs up through the UI and deletes the account', async ({ loginPage, signupPage, api }) => {
    const user = buildUser();

    await test.step('start signup with name and email', async () => {
      await loginPage.goto();
      await loginPage.startSignup(user.name, user.email);
      await expect(signupPage.accountInfoHeading).toBeVisible();
    });

    await test.step('fill account details and create the account', async () => {
      await signupPage.fillAccountDetails(user);
      await signupPage.submit();
      await expect(signupPage.accountCreated).toHaveText(/Account Created!/i);
      await signupPage.continueButton.click();
      await expect(signupPage.loggedInAs).toHaveText(`Logged in as ${user.name}`);
    });

    await test.step('the API sees the new account', async () => {
      const { body } = await api.getUserByEmail(user.email);
      expect(body.user).toMatchObject({ name: user.name, city: user.city, zipcode: user.zipcode });
    });

    await test.step('delete the account from the UI', async () => {
      await signupPage.deleteAccount();
      await expect(signupPage.accountDeleted).toHaveText(/Account Deleted!/i);
      const { body } = await api.verifyLogin(user.email, user.password);
      expect(body.responseCode).toBe(404);
    });
  });

  test('signup with an existing email is blocked', async ({ loginPage, newUser }) => {
    await loginPage.goto();
    await loginPage.startSignup('Someone Else', newUser.email);
    await expect(loginPage.signupError).toBeVisible();
  });
});
