import { test, expect } from '../../src/fixtures/test';
import { buildUser } from '../../src/utils/userFactory';

test.describe('Account API', () => {
  test('account lifecycle: create, read, verify login, delete', { tag: '@smoke' }, async ({ api }) => {
    const user = buildUser();

    await test.step('create the account', async () => {
      const { body } = await api.createAccount(user);
      expect(body).toEqual({ responseCode: 201, message: 'User created!' });
    });

    await test.step('details match what was sent', async () => {
      const { body } = await api.getUserByEmail(user.email);
      expect(body.responseCode).toBe(200);
      expect(body.user).toMatchObject({
        name: user.name,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        company: user.company,
        address1: user.address1,
        country: user.country,
        state: user.state,
        city: user.city,
        zipcode: user.zipcode,
      });
    });

    await test.step('login is verified', async () => {
      const { body } = await api.verifyLogin(user.email, user.password);
      expect(body).toEqual({ responseCode: 200, message: 'User exists!' });
    });

    await test.step('delete the account', async () => {
      const { body } = await api.deleteAccount(user.email, user.password);
      expect(body).toEqual({ responseCode: 200, message: 'Account deleted!' });
    });

    await test.step('deleted user can no longer log in', async () => {
      const { body } = await api.verifyLogin(user.email, user.password);
      expect(body.responseCode).toBe(404);
    });
  });

  test('creating an account with an existing email is rejected', async ({ api, newUser }) => {
    const { body } = await api.createAccount(buildUser({ email: newUser.email }));
    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/already exists/i);
  });

  test('wrong password is not verified', async ({ api, newUser }) => {
    const { body } = await api.verifyLogin(newUser.email, 'not-the-password');
    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('verify login without an email is a bad request', async ({ api }) => {
    const { body } = await api.verifyLoginWithoutEmail('any-password');
    expect(body).toEqual({
      responseCode: 400,
      message: 'Bad request, email or password parameter is missing in POST request.',
    });
  });

  test('DELETE /verifyLogin is rejected with 405', async ({ api }) => {
    const { body } = await api.deleteVerifyLogin();
    expect(body).toEqual({ responseCode: 405, message: 'This request method is not supported.' });
  });

  test('details for an unknown email are not found', async ({ api }) => {
    const { body } = await api.getUserByEmail(buildUser().email);
    expect(body.responseCode).toBe(404);
  });
});
