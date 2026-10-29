import { test, expect } from '../../src/fixtures/test';

test.describe('Products page', () => {
  test('home page loads', { tag: '@smoke' }, async ({ homePage, page }) => {
    await homePage.goto();
    await expect(page).toHaveTitle(/Automation Exercise/);
    await expect(homePage.featuredItems).toBeVisible();
  });

  test('catalogue in the UI matches the API', { tag: '@smoke' }, async ({ productsPage, api }) => {
    const { body } = await api.getProducts();

    await productsPage.goto();
    await expect(productsPage.heading).toHaveText('All Products');
    await expect(productsPage.productCards).toHaveCount(body.products.length);
  });

  test('search shows the same products as the search API', async ({ productsPage, api }) => {
    const term = 'top';
    const { body } = await api.searchProducts(term);
    const expected = body.products.map((p) => p.name.trim()).sort();

    await productsPage.goto();
    await productsPage.search(term);

    await expect(productsPage.heading).toHaveText('Searched Products');
    await expect(productsPage.productCards).toHaveCount(expected.length);
    const shown = (await productsPage.productNames.allInnerTexts()).map((n) => n.trim()).sort();
    expect(shown).toEqual(expected);
  });

  test('product details match the API data', async ({ productsPage, productDetailsPage, api, page }) => {
    const { body } = await api.getProducts();
    const product = body.products[0];

    await productsPage.goto();
    await productsPage.openDetails(product.name);

    await expect(page).toHaveURL(new RegExp(`/product_details/${product.id}$`));
    await expect(productDetailsPage.name).toHaveText(product.name);
    await expect(productDetailsPage.price).toHaveText(product.price);
    await expect(productDetailsPage.brand).toContainText(product.brand);
    await expect(productDetailsPage.category).toContainText(
      `${product.category.usertype.usertype} > ${product.category.category}`,
    );
    await expect(productDetailsPage.availability).toBeVisible();
  });
});
