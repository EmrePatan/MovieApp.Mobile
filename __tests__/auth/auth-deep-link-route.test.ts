import {
  buildAuthDeepLinkRouterHref,
  resolveAuthDeepLinkRouterPath,
} from '@/auth/auth-deep-link-route';

describe('auth-deep-link-route', () => {
  it('maps verify-email custom scheme URLs to grouped auth routes', () => {
    expect(
      resolveAuthDeepLinkRouterPath('movieapp://verify-email?token=raw-token-value'),
    ).toBe('/(auth)/verify-email?token=raw-token-value');
  });

  it('maps reset-password custom scheme URLs to grouped auth routes', () => {
    expect(
      resolveAuthDeepLinkRouterPath('movieapp://reset-password?token=encoded%2Btoken'),
    ).toBe('/(auth)/reset-password?token=encoded%2Btoken');
  });

  it('returns null for unrelated URLs', () => {
    expect(resolveAuthDeepLinkRouterPath('movieapp://movie/123')).toBeNull();
  });

  it('builds router href objects for navigation fallback', () => {
    expect(
      buildAuthDeepLinkRouterHref({
        kind: 'verify-email',
        token: 'abc123',
      }),
    ).toEqual({
      pathname: '/(auth)/verify-email',
      params: { token: 'abc123' },
    });
  });
});
