import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly featuredItems: Locator;

  constructor(page: Page) {
    super(page);
    this.featuredItems = page.locator('.features_items');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
