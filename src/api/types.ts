/** Response shapes for the Automation Exercise API. */

export interface Product {
  id: number;
  name: string;
  price: string; // e.g. "Rs. 500"
  brand: string;
  category: {
    usertype: { usertype: string };
    category: string;
  };
}

export interface ProductsResponse {
  responseCode: number;
  products: Product[];
}

export interface Brand {
  id: number;
  brand: string;
}

export interface BrandsResponse {
  responseCode: number;
  brands: Brand[];
}

export interface MessageResponse {
  responseCode: number;
  message: string;
}
