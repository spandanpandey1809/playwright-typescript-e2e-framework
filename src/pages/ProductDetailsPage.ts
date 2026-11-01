import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /product_details/{id} */
export class ProductDetailsPage extends BasePage {
  readonly info: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly category: Locator;
  readonly availability: Locator;
  readonly brand: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.info = page.locator('.product-information');
    this.name = this.info.locator('h2');
    this.price = this.info.locator('span > span');
    this.category = this.info.locator('p', { hasText: 'Category:' });
    this.availability = this.info.locator('p', { hasText: 'Availability:' });
    this.brand = this.info.locator('p', { hasText: 'Brand:' });
    this.quantity = page.locator('#quantity');
    this.addToCartButton = this.info.getByRole('button', { name: 'Add to cart' });
  }

  async goto(productId: number): Promise<void> {
    await this.page.goto(`/product_details/${productId}`);
  }

  async addToCart(quantity = 1): Promise<void> {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
    await this.cartModal.waitFor();
  }
}
