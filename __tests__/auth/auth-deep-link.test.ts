import { parseAuthDeepLink } from '@/auth/auth-deep-link';

describe('auth-deep-link', () => {
  it('parses verify-email deep links', () => {
    expect(
      parseAuthDeepLink('movieapp://verify-email?token=raw-token-value'),
    ).toEqual({
      kind: 'verify-email',
      token: 'raw-token-value',
    });
  });

  it('parses reset-password deep links', () => {
    expect(
      parseAuthDeepLink('movieapp://reset-password?token=encoded%2Btoken'),
    ).toEqual({
      kind: 'reset-password',
      token: 'encoded+token',
    });
  });

  it('returns null for unrelated URLs', () => {
    expect(parseAuthDeepLink('movieapp://movie/123')).toBeNull();
    expect(parseAuthDeepLink(null)).toBeNull();
  });
});
