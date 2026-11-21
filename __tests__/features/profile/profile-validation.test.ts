import {
  validateChangeEmail,
  validateChangePassword,
  validateDeleteAccount,
  validateUpdateProfile,
  hasProfileValidationErrors,
} from '@/features/profile/utils/profile-validation';

describe('profile validation', () => {
  it('validates display name', () => {
    expect(hasProfileValidationErrors(validateUpdateProfile(''))).toBe(true);
    expect(hasProfileValidationErrors(validateUpdateProfile('Emre'))).toBe(false);
  });

  it('validates bio length and social drafts', () => {
    expect(hasProfileValidationErrors(validateUpdateProfile('Emre', 'x'.repeat(301)))).toBe(true);
    expect(
      hasProfileValidationErrors(
        validateUpdateProfile('Emre', 'ok', { website: 'not a url :::' }),
      ),
    ).toBe(true);
    expect(
      hasProfileValidationErrors(
        validateUpdateProfile('Emre', 'ok', { instagram: '@emre', website: 'https://ok.dev' }),
      ),
    ).toBe(false);
  });


  it('validates email change', () => {
    expect(hasProfileValidationErrors(validateChangeEmail('', ''))).toBe(true);
    expect(
      hasProfileValidationErrors(
        validateChangeEmail('user@example.com', 'current-password'),
      ),
    ).toBe(false);
  });

  it('validates password change', () => {
    expect(
      hasProfileValidationErrors(
        validateChangePassword('current', 'newpassword', 'newpassword'),
      ),
    ).toBe(false);
    expect(
      hasProfileValidationErrors(
        validateChangePassword('current', 'newpassword', 'different'),
      ),
    ).toBe(true);
  });

  it('validates delete account password', () => {
    expect(hasProfileValidationErrors(validateDeleteAccount(''))).toBe(true);
    expect(hasProfileValidationErrors(validateDeleteAccount('password'))).toBe(false);
  });
});
