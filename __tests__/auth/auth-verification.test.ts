import {
  getProblemCode,
  getUserMessageForAuthError,
  isEmailNotVerifiedError,
} from '@/api/errors';
import { ApiError } from '@/api/errors';

describe('auth verification errors', () => {
  it('detects email_not_verified problem code', () => {
    const error = new ApiError({
      kind: 'unauthorized',
      status: 401,
      responseBody: { code: 'email_not_verified', detail: 'Please verify your email.' },
    });

    expect(isEmailNotVerifiedError(error)).toBe(true);
    expect(getProblemCode(error.responseBody)).toBe('email_not_verified');
  });

  it('returns verify-email validation message', () => {
    expect(getUserMessageForAuthError('validation', 'verify-email')).toBe(
      'Invalid or expired verification link.',
    );
  });
});
