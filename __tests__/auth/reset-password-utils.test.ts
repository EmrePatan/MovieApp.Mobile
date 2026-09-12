import { parseResetPasswordTokenParam, extractTokenFromResetUrl } from '@/auth/reset-password-utils';

describe('reset-password-utils', () => {
  it('parses token query params from expo-router values', () => {
    expect(parseResetPasswordTokenParam('abc123')).toBe('abc123');
    expect(parseResetPasswordTokenParam([' encoded%20token ', 'ignored'])).toBe('encoded%20token');
    expect(parseResetPasswordTokenParam(undefined)).toBe('');
  });

  it('extracts URL-encoded tokens from reset links', () => {
    const token = 'abc+def/ghi=';
    const resetUrl = `movieapp://reset-password?token=${encodeURIComponent(token)}`;

    expect(extractTokenFromResetUrl(resetUrl)).toBe(token);
  });

  it('returns null for malformed reset links', () => {
    expect(extractTokenFromResetUrl('movieapp://reset-password')).toBeNull();
    expect(extractTokenFromResetUrl('')).toBeNull();
  });
});
