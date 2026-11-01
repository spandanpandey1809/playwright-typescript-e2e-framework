import { randomUUID } from 'crypto';

export interface TestUser {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs';
  birthDay: string;
  birthMonth: string; // 1-12
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

/**
 * A brand-new user with a unique email, so tests never share accounts and can
 * run in parallel. Fields can be overridden for specific scenarios.
 */
export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = randomUUID().slice(0, 8);
  return {
    name: `PW User ${id}`,
    email: `pw.${Date.now()}.${id}@example.com`,
    password: `Pw!${id}`,
    title: 'Mr',
    birthDay: '10',
    birthMonth: '5',
    birthYear: '1998',
    firstName: 'Test',
    lastName: `User${id}`,
    company: 'QA Labs',
    address1: '221 MG Road',
    address2: 'Hazratganj',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    zipcode: '226001',
    mobileNumber: '9876543210',
    ...overrides,
  };
}
