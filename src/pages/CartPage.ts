import { type Locator, type Page } from '@playwright/test';
import { parsePrice } from '../utils/price';
import { BasePage } from './BasePage';

export interface CartLine {
  name: string;
  price: number;
  quantity: number;
  total: number;
}

/** /view_cart */
export class CartPage extends BasePage {
  readonly rows: Locator;
  readonly emptyMessage: Locator;
  readonly proceedToCheckout: Locator;
  readonly checkoutModal: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#cart_info_table tbody tr');
    this.emptyMessage = page.locator('#empty_cart');
    this.proceedToCheckout = page.getByText('Proceed To Checkout');
    this.checkoutModal = page.locator('#checkoutModal');
  }

  async goto(): Promise<void> {
    await this.page.goto('/view_cart');
  }

  row(name: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('link', { name, exact: true }) });
  }

  /** Reads one cart row into numbers, so tests can do arithmetic on it. */
  async line(name: string): Promise<CartLine> {
    const row = this.row(name);
    return {
      name: (await row.locator('.cart_description h4').innerText()).trim(),
      price: parsePrice(await row.locator('.cart_price').innerText()),
      quantity: Number((await row.locator('.cart_quantity').innerText()).trim()),
      total: parsePrice(await row.locator('.cart_total_price').innerText()),
    };
  }

  async remove(name: string): Promise<void> {
    const row = this.row(name);
    await row.locator('.cart_quantity_delete').click();
    await row.waitFor({ state: 'detached' });
  }
}
