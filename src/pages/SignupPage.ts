import { type Locator, type Page } from '@playwright/test';
import type { TestUser } from '../utils/userFactory';
import { BasePage } from './BasePage';

/** /signup: the account details form, plus the "Account Created / Deleted" screens. */
export class SignupPage extends BasePage {
  readonly accountInfoHeading: Locator;
  readonly accountCreated: Locator;
  readonly accountDeleted: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountInfoHeading = page.getByText('Enter Account Information');
    this.accountCreated = page.getByTestId('account-created');
    this.accountDeleted = page.getByTestId('account-deleted');
    this.continueButton = page.getByTestId('continue-button');
  }

  async fillAccountDetails(user: TestUser): Promise<void> {
    await this.page.locator(user.title === 'Mr' ? '#id_gender1' : '#id_gender2').check();
    await this.page.getByTestId('password').fill(user.password);
    await this.page.getByTestId('days').selectOption(user.birthDay);
    await this.page.getByTestId('months').selectOption(user.birthMonth);
    await this.page.getByTestId('years').selectOption(user.birthYear);
    await this.page.getByTestId('first_name').fill(user.firstName);
    await this.page.getByTestId('last_name').fill(user.lastName);
    await this.page.getByTestId('company').fill(user.company);
    await this.page.getByTestId('address').fill(user.address1);
    await this.page.getByTestId('address2').fill(user.address2);
    await this.page.getByTestId('country').selectOption(user.country);
    await this.page.getByTestId('state').fill(user.state);
    await this.page.getByTestId('city').fill(user.city);
    await this.page.getByTestId('zipcode').fill(user.zipcode);
    await this.page.getByTestId('mobile_number').fill(user.mobileNumber);
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('create-account').click();
  }
}
