import { getApiBaseUrl, API_REQUEST_TIMEOUT_MS } from '@/api/config';

describe('api config', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;
  const originalAppEnv = process.env.EXPO_PUBLIC_APP_ENV;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
    process.env.EXPO_PUBLIC_APP_ENV = originalAppEnv;
  });

  it('reads the API base URL from environment configuration', () => {
    process.env.EXPO_PUBLIC_APP_ENV = 'development';
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:5027/';
    expect(getApiBaseUrl()).toBe('http://localhost:5027');
  });

  it('throws when the API URL is missing', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    expect(() => getApiBaseUrl()).toThrow('EXPO_PUBLIC_API_URL is not configured');
  });

  it('defines a request timeout', () => {
    expect(API_REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
  });
});
