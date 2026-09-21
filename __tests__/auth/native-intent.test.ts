import { redirectSystemPath } from '../../app/+native-intent';

describe('+native-intent redirectSystemPath', () => {
  it('redirects cold-start verify-email URLs to grouped auth routes', () => {
    expect(
      redirectSystemPath({
        path: 'movieapp://verify-email?token=abc123',
        initial: true,
      }),
    ).toBe('/(auth)/verify-email?token=abc123');
  });

  it('redirects warm reset-password URLs to grouped auth routes', () => {
    expect(
      redirectSystemPath({
        path: 'movieapp://reset-password?token=reset-token',
        initial: false,
      }),
    ).toBe('/(auth)/reset-password?token=reset-token');
  });

  it('passes unrelated URLs through unchanged', () => {
    const path = 'movieapp://movie/123';
    expect(redirectSystemPath({ path, initial: true })).toBe(path);
  });
});
