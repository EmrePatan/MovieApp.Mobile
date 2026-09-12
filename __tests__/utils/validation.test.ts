import {
  hasValidationErrors,
  validateLoginForm,
  validateRegisterForm,
} from '@/utils/validation';

describe('validation', () => {
  it('validates login form fields', () => {
    expect(validateLoginForm('', '')).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
    });
  });

  it('validates register form fields against backend rules', () => {
    const errors = validateRegisterForm('bad-email', 'short', '');

    expect(errors.email).toBeTruthy();
    expect(errors.password).toMatch(/at least 8 characters/);
    expect(errors.displayName).toBeTruthy();
    expect(hasValidationErrors(errors)).toBe(true);
  });

  it('accepts valid register input', () => {
    const errors = validateRegisterForm('user@example.com', 'securepassword', 'Emre');

    expect(hasValidationErrors(errors)).toBe(false);
  });
});
