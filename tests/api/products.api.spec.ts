import { test, expect } from '../../src/fixtures/test';

/** Letters and digits only, lower case: "T-Shirts" -> "tshirts" */
const normalise = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

test.describe('Products API', () => {
  test('GET /productsList returns the full catalogue', { tag: '@smoke' }, async ({ api }) => {
    const { httpStatus, body } = await api.getProducts();

    expect(httpStatus).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(body.products.length).toBeGreaterThan(0);

    for (const product of body.products) {
      expect.soft(product.id, `id of ${product.name}`).toEqual(expect.any(Number));
      expect.soft(product.name.trim(), `name of product ${product.id}`).not.toBe('');
      expect.soft(product.price, `price of ${product.name}`).toMatch(/^Rs\. \d+$/);
      expect.soft(product.brand, `brand of ${product.name}`).not.toBe('');
      expect.soft(product.category.category, `category of ${product.name}`).not.toBe('');
    }
  });

  test('product ids are unique', async ({ api }) => {
    const { body } = await api.getProducts();
    const ids = body.products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('POST /productsList is rejected with 405', async ({ api }) => {
    const { body } = await api.postProducts();
    expect(body).toEqual({ responseCode: 405, message: 'This request method is not supported.' });
  });
});

test.describe('Brands API', () => {
  test('GET /brandsList returns brands used by products', { tag: '@smoke' }, async ({ api }) => {
    const [brands, products] = await Promise.all([api.getBrands(), api.getProducts()]);

    expect(brands.body.responseCode).toBe(200);
    const brandNames = new Set(brands.body.brands.map((b) => b.brand));
    // Every product's brand must exist in the brands list
    for (const product of products.body.products) {
      expect.soft(brandNames.has(product.brand), `brand "${product.brand}" of ${product.name}`).toBe(true);
    }
  });

  test('PUT /brandsList is rejected with 405', async ({ api }) => {
    const { body } = await api.putBrands();
    expect(body).toEqual({ responseCode: 405, message: 'This request method is not supported.' });
  });
});

test.describe('Search API', () => {
  for (const term of ['top', 'tshirt', 'jean']) {
    test(`search "${term}" returns only matching products`, async ({ api }) => {
      const { body } = await api.searchProducts(term);

      expect(body.responseCode).toBe(200);
      expect(body.products.length).toBeGreaterThan(0);
      for (const p of body.products) {
        const searchable = normalise(`${p.name} ${p.category.category}`);
        expect.soft(searchable, `${p.name} (${p.category.category})`).toContain(normalise(term));
      }
    });
  }

  test('search without a term is a bad request', async ({ api }) => {
    const { body } = await api.searchWithoutTerm();
    expect(body).toEqual({
      responseCode: 400,
      message: 'Bad request, search_product parameter is missing in POST request.',
    });
  });
});
