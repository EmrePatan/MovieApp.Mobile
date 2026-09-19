import {
  extractTokenFromVerificationUrl,
  parseVerifyEmailTokenParam,
} from '@/auth/verify-email-utils';

describe('verify-email-utils', () => {
  it('parses token param from string', () => {
    expect(parseVerifyEmailTokenParam('abc123')).toBe('abc123');
  });

  it('parses token param from array', () => {
    expect(parseVerifyEmailTokenParam(['token-value', 'ignored'])).toBe('token-value');
  });

  it('extracts token from verification url', () => {
    expect(
      extractTokenFromVerificationUrl('movieapp://verify-email?token=encoded%2Btoken'),
    ).toBe('encoded+token');
  });
});
