const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface RegisterFormErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

export interface ForgotPasswordFormErrors {
  email?: string;
}

export interface ResetPasswordFormErrors {
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function validateLoginForm(email: string, password: string): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length > 128) {
    errors.password = 'Password must be at most 128 characters.';
  }

  return errors;
}

export function validateRegisterForm(
  email: string,
  password: string,
  displayName: string,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  const trimmedEmail = email.trim();
  const trimmedDisplayName = displayName.trim();

  if (!trimmedEmail) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  } else if (trimmedEmail.length > 320) {
    errors.email = 'Email must be at most 320 characters.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (password.length > 128) {
    errors.password = 'Password must be at most 128 characters.';
  }

  if (!trimmedDisplayName) {
    errors.displayName = 'Display name is required.';
  } else if (trimmedDisplayName.length > 100) {
    errors.displayName = 'Display name must be at most 100 characters.';
  }

  return errors;
}

export function validateForgotPasswordForm(email: string): ForgotPasswordFormErrors {
  const errors: ForgotPasswordFormErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  } else if (trimmedEmail.length > 320) {
    errors.email = 'Email must be at most 320 characters.';
  }

  return errors;
}

export function validateResetPasswordForm(
  token: string,
  newPassword: string,
  confirmPassword: string,
): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    errors.token = 'Reset token is required.';
  }

  if (!newPassword) {
    errors.newPassword = 'Password is required.';
  } else if (newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters.';
  } else if (newPassword.length > 128) {
    errors.newPassword = 'Password must be at most 128 characters.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function hasValidationErrors(
  errors: LoginFormErrors | RegisterFormErrors | ForgotPasswordFormErrors | ResetPasswordFormErrors,
): boolean {
  return Object.values(errors).some(Boolean);
}
