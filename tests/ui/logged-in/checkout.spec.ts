import { test, expect } from '../../../src/fixtures/auth';
import { TEST_CARD } from '../../../src/pages/CheckoutPage';
import { formatPrice, parsePrice } from '../../../src/utils/price';

/** Same order flow as checkout.spec.ts, but starting from the saved session: no login steps. */
test('saved-session user places an order', async ({
  productDetailsPage,
  cartPage,
  checkoutPage,
  paymentPage,
  account,
  api,
}) => {
  const product = (await api.getProducts()).body.products[3];

  await productDetailsPage.goto(product.id);
  await productDetailsPage.addToCart();
  await productDetailsPage.viewCartFromModal();
  await cartPage.proceedToCheckout.click();

  await expect(checkoutPage.deliveryAddress).toContainText(`${account.firstName} ${account.lastName}`);
  await expect(checkoutPage.totalAmount).toHaveText(formatPrice(parsePrice(product.price)));

  await checkoutPage.placeOrder('Saved-session order');
  await paymentPage.pay(TEST_CARD);
  await expect(paymentPage.orderPlaced).toContainText(/Order Placed!/i);
});
