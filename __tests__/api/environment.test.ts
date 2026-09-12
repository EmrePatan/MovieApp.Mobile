import {
  getAppEnvironment,
  isDevelopmentHost,
  validateApiBaseUrl,
} from '@/api/environment';

describe('app environment', () => {
  const originalAppEnv = process.env.EXPO_PUBLIC_APP_ENV;

  afterEach(() => {
    process.env.EXPO_PUBLIC_APP_ENV = originalAppEnv;
  });

  it('defaults to development when APP_ENV is unset', () => {
    delete process.env.EXPO_PUBLIC_APP_ENV;
    expect(getAppEnvironment()).toBe('development');
  });

  it('reads configured app environment', () => {
    process.env.EXPO_PUBLIC_APP_ENV = 'production';
    expect(getAppEnvironment()).toBe('production');
  });

  it('detects development hosts', () => {
    expect(isDevelopmentHost('localhost')).toBe(true);
    expect(isDevelopmentHost('127.0.0.1')).toBe(true);
    expect(isDevelopmentHost('10.0.2.2')).toBe(true);
    expect(isDevelopmentHost('192.168.1.11')).toBe(true);
    expect(isDevelopmentHost('api.example.com')).toBe(false);
  });

  it('allows localhost in development', () => {
    process.env.EXPO_PUBLIC_APP_ENV = 'development';
    expect(validateApiBaseUrl('http://localhost:5027/')).toBe('http://localhost:5027');
  });

  it('requires HTTPS and public host in production', () => {
    process.env.EXPO_PUBLIC_APP_ENV = 'production';

    expect(validateApiBaseUrl('https://api.example.com/')).toBe('https://api.example.com');

    expect(() => validateApiBaseUrl('http://api.example.com')).toThrow('HTTPS');
    expect(() => validateApiBaseUrl('http://localhost:5027')).toThrow('HTTPS');
    expect(() => validateApiBaseUrl('https://192.168.1.11')).toThrow('private LAN');
  });
});
