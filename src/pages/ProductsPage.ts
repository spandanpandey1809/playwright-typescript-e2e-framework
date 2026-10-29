import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /products: the full catalogue and the search box. */
export class ProductsPage extends BasePage {
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('.features_items h2.title');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.productNames = this.productCards.locator('.productinfo p');
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** The product card whose name matches exactly. */
  card(name: string): Locator {
    return this.productCards.filter({
      has: this.page.locator('.productinfo p', { hasText: new RegExp(`^${escapeRegex(name)}$`) }),
    });
  }

  async openDetails(name: string): Promise<void> {
    await this.card(name).getByRole('link', { name: 'View Product' }).click();
  }
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
