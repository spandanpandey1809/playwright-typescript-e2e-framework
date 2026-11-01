import { type Locator, type Page } from '@playwright/test';

/** Shared header navigation and the "Added to cart" pop-up. Every page object extends this. */
export abstract class BasePage {
  readonly header: Locator;
  readonly loggedInAs: Locator;
  readonly cartModal: Locator;

  constructor(protected readonly page: Page) {
    this.header = page.locator('#header');
    this.loggedInAs = this.header.getByText(/Logged in as/);
    this.cartModal = page.locator('#cartModal');
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

  async logout(): Promise<void> {
    await this.header.getByRole('link', { name: 'Logout' }).click();
  }

  async deleteAccount(): Promise<void> {
    await this.header.getByRole('link', { name: 'Delete Account' }).click();
  }

  async continueShopping(): Promise<void> {
    await this.cartModal.getByRole('button', { name: 'Continue Shopping' }).click();
    await this.cartModal.waitFor({ state: 'hidden' });
  }

  async viewCartFromModal(): Promise<void> {
    await this.cartModal.getByRole('link', { name: 'View Cart' }).click();
  }
}
