import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /checkout: address review, order review and the comment box. */
export class CheckoutPage extends BasePage {
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly totalAmount: Locator;
  readonly comment: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.totalAmount = page.locator('tr', { hasText: 'Total Amount' }).locator('.cart_total_price');
    this.comment = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
  }

  async placeOrder(comment: string): Promise<void> {
    await this.comment.fill(comment);
    await this.placeOrderButton.click();
  }
}

export interface Card {
  nameOnCard: string;
  number: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

/** /payment and the "Order Placed" confirmation. */
export class PaymentPage extends BasePage {
  readonly orderPlaced: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.orderPlaced = page.getByTestId('order-placed');
    this.confirmation = page.getByText('Congratulations! Your order has been confirmed!');
  }

  async pay(card: Card): Promise<void> {
    await this.page.getByTestId('name-on-card').fill(card.nameOnCard);
    await this.page.getByTestId('card-number').fill(card.number);
    await this.page.getByTestId('cvc').fill(card.cvc);
    await this.page.getByTestId('expiry-month').fill(card.expiryMonth);
    await this.page.getByTestId('expiry-year').fill(card.expiryYear);
    await this.page.getByTestId('pay-button').click();
  }
}

/** A dummy card for this demo store; it never reaches a real payment provider. */
export const TEST_CARD: Card = {
  nameOnCard: 'Test User',
  number: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2030',
};
