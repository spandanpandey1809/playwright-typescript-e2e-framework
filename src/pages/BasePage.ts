import { type Locator, type Page } from '@playwright/test';

/** Shared header navigation. Every page object extends this. */
export abstract class BasePage {
  readonly header: Locator;

  constructor(protected readonly page: Page) {
    this.header = page.locator('#header');
  }

  async openProducts(): Promise<void> {
    await this.header.getByRole('link', { name: 'Products' }).click();
  }

  async openCart(): Promise<void> {
    await this.header.getByRole('link', { name: 'Cart' }).click();
  }

  async openLogin(): Promise<void> {
    await this.header.getByRole('link', { name: 'Signup / Login' }).click();
  }
}
