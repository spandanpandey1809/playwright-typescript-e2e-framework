import { type APIRequestContext, type APIResponse } from '@playwright/test';
import type { TestUser } from '../utils/userFactory';
import type {
  BrandsResponse,
  MessageResponse,
  ProductsResponse,
  UserDetailsResponse,
} from './types';

/**
 * Service layer for the Automation Exercise API (https://automationexercise.com/api_list).
 *
 * Quirk worth knowing: the API always answers HTTP 200 and puts the real status
 * in the body as "responseCode", and it labels JSON as text/html. So every call
 * returns the HTTP status AND the parsed body, and tests assert on both.
 */
export interface ApiResult<T> {
  httpStatus: number;
  body: T;
}

export class StoreApi {
  constructor(private readonly request: APIRequestContext) {}

  // ---- Products ----

  getProducts(): Promise<ApiResult<ProductsResponse>> {
    return this.call(this.request.get('/api/productsList'));
  }

  postProducts(): Promise<ApiResult<MessageResponse>> {
    return this.call(this.request.post('/api/productsList'));
  }

  getBrands(): Promise<ApiResult<BrandsResponse>> {
    return this.call(this.request.get('/api/brandsList'));
  }

  putBrands(): Promise<ApiResult<MessageResponse>> {
    return this.call(this.request.put('/api/brandsList'));
  }

  searchProducts(term: string): Promise<ApiResult<ProductsResponse>> {
    return this.call(this.request.post('/api/searchProduct', { form: { search_product: term } }));
  }

  searchWithoutTerm(): Promise<ApiResult<MessageResponse>> {
    return this.call(this.request.post('/api/searchProduct'));
  }

  // ---- Accounts ----

  createAccount(user: TestUser): Promise<ApiResult<MessageResponse>> {
    return this.call(
      this.request.post('/api/createAccount', {
        form: {
          name: user.name,
          email: user.email,
          password: user.password,
          title: user.title,
          birth_date: user.birthDay,
          birth_month: user.birthMonth,
          birth_year: user.birthYear,
          firstname: user.firstName,
          lastname: user.lastName,
          company: user.company,
          address1: user.address1,
          address2: user.address2,
          country: user.country,
          zipcode: user.zipcode,
          state: user.state,
          city: user.city,
          mobile_number: user.mobileNumber,
        },
      }),
    );
  }

  deleteAccount(email: string, password: string): Promise<ApiResult<MessageResponse>> {
    return this.call(this.request.delete('/api/deleteAccount', { form: { email, password } }));
  }

  verifyLogin(email: string, password: string): Promise<ApiResult<MessageResponse>> {
    return this.call(this.request.post('/api/verifyLogin', { form: { email, password } }));
  }

  verifyLoginWithoutEmail(password: string): Promise<ApiResult<MessageResponse>> {
    return this.call(this.request.post('/api/verifyLogin', { form: { password } }));
  }

  deleteVerifyLogin(): Promise<ApiResult<MessageResponse>> {
    return this.call(this.request.delete('/api/verifyLogin'));
  }

  getUserByEmail(email: string): Promise<ApiResult<UserDetailsResponse & MessageResponse>> {
    return this.call(this.request.get('/api/getUserDetailByEmail', { params: { email } }));
  }

  private async call<T>(pending: Promise<APIResponse>): Promise<ApiResult<T>> {
    const response = await pending;
    const text = await response.text();
    let body: T;
    try {
      body = JSON.parse(text) as T;
    } catch {
      throw new Error(`Expected JSON from ${response.url()} but got: ${text.slice(0, 200)}`);
    }
    return { httpStatus: response.status(), body };
  }
}
