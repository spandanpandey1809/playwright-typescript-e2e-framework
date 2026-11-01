import { test, expect } from '../../src/fixtures/test';
import { TEST_CARD } from '../../src/pages/CheckoutPage';
import { formatPrice, parsePrice } from '../../src/utils/price';

test.describe('Checkout', () => {
  test('a guest is asked to log in before checkout', async ({ productDetailsPage, cartPage, api }) => {
    const product = (await api.getProducts()).body.products[0];

    await productDetailsPage.goto(product.id);
    await productDetailsPage.addToCart();
    await productDetailsPage.viewCartFromModal();
    await cartPage.proceedToCheckout.click();

    await expect(cartPage.checkoutModal).toBeVisible();
    await expect(cartPage.checkoutModal.getByRole('link', { name: 'Register / Login' })).toBeVisible();
  });

  test('logged-in user places an order end to end', async ({
    loginPage,
    productDetailsPage,
    cartPage,
    checkoutPage,
    paymentPage,
    newUser,
    api,
  }) => {
    const product = (await api.getProducts()).body.products[1];
    const quantity = 2;

    await test.step('log in', async () => {
      await loginPage.goto();
      await loginPage.login(newUser.email, newUser.password);
      await expect(loginPage.loggedInAs).toContainText(newUser.name);
    });

    await test.step('add the product and go to checkout', async () => {
      await productDetailsPage.goto(product.id);
      await productDetailsPage.addToCart(quantity);
      await productDetailsPage.viewCartFromModal();
      await cartPage.proceedToCheckout.click();
    });

    await test.step('delivery and billing addresses come from the account', async () => {
      for (const address of [checkoutPage.deliveryAddress, checkoutPage.billingAddress]) {
        await expect.soft(address).toContainText(`${newUser.firstName} ${newUser.lastName}`);
        await expect.soft(address).toContainText(newUser.address1);
        await expect.soft(address).toContainText(newUser.city);
        await expect.soft(address).toContainText(newUser.zipcode);
        await expect.soft(address).toContainText(newUser.country);
        await expect.soft(address).toContainText(newUser.mobileNumber);
      }
    });

    await test.step('order total is price x quantity', async () => {
      await expect(checkoutPage.totalAmount).toHaveText(formatPrice(parsePrice(product.price) * quantity));
    });

    await test.step('pay and see the confirmation', async () => {
      await checkoutPage.placeOrder('Please deliver between 9 and 5.');
      await paymentPage.pay(TEST_CARD);
      await expect(paymentPage.orderPlaced).toContainText(/Order Placed!/i);
      await expect(paymentPage.confirmation).toBeVisible();
    });
  });
});
