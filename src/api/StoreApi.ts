import { type APIRequestContext, type APIResponse } from '@playwright/test';
import type { BrandsResponse, MessageResponse, ProductsResponse } from './types';

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
