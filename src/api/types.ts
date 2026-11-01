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

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  title: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface UserDetailsResponse {
  responseCode: number;
  user: UserDetails;
}
