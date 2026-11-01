import { test, expect } from '../../src/fixtures/test';
import { parsePrice } from '../../src/utils/price';

test.describe('Cart', () => {
  test('products added from the catalogue appear in the cart with correct totals', async ({
    productsPage,
    cartPage,
    api,
  }) => {
    const { body } = await api.getProducts();
    const picks = body.products.slice(0, 2);

    await productsPage.goto();
    for (const product of picks) {
      await productsPage.addToCart(product.name);
      await productsPage.continueShopping();
    }
    await cartPage.goto();

    await expect(cartPage.rows).toHaveCount(picks.length);
    for (const product of picks) {
      const line = await cartPage.line(product.name);
      expect.soft(line.price, product.name).toBe(parsePrice(product.price));
      expect.soft(line.quantity, product.name).toBe(1);
      expect.soft(line.total, product.name).toBe(line.price);
    }
  });

  test('quantity chosen on the product page is kept in the cart', { tag: '@smoke' }, async ({
    productDetailsPage,
    cartPage,
    api,
  }) => {
    const product = (await api.getProducts()).body.products[2];
    const quantity = 4;

    await productDetailsPage.goto(product.id);
    await productDetailsPage.addToCart(quantity);
    await productDetailsPage.viewCartFromModal();

    const line = await cartPage.line(product.name);
    expect(line.quantity).toBe(quantity);
    expect(line.total).toBe(line.price * quantity);
  });

  test('removing the only product empties the cart', async ({ productDetailsPage, cartPage, api }) => {
    const product = (await api.getProducts()).body.products[0];

    await productDetailsPage.goto(product.id);
    await productDetailsPage.addToCart();
    await productDetailsPage.viewCartFromModal();
    await expect(cartPage.rows).toHaveCount(1);

    await cartPage.remove(product.name);

    await expect(cartPage.rows).toHaveCount(0);
    await expect(cartPage.emptyMessage).toContainText('Cart is empty!');
  });
});
