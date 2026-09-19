import { i18n } from '@/i18n';

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
    errors.email = i18n.t('validation.emailRequired');
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = i18n.t('validation.emailInvalid');
  }

  if (!password) {
    errors.password = i18n.t('validation.passwordRequired');
  } else if (password.length > 128) {
    errors.password = i18n.t('validation.passwordTooLong');
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
    errors.email = i18n.t('validation.emailRequired');
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = i18n.t('validation.emailInvalid');
  } else if (trimmedEmail.length > 320) {
    errors.email = i18n.t('validation.emailTooLong');
  }

  if (!password) {
    errors.password = i18n.t('validation.passwordRequired');
  } else if (password.length < 8) {
    errors.password = i18n.t('validation.passwordTooShort');
  } else if (password.length > 128) {
    errors.password = i18n.t('validation.passwordTooLong');
  }

  if (!trimmedDisplayName) {
    errors.displayName = i18n.t('validation.displayNameRequired');
  } else if (trimmedDisplayName.length > 100) {
    errors.displayName = i18n.t('validation.displayNameTooLong');
  }

  return errors;
}

export function validateForgotPasswordForm(email: string): ForgotPasswordFormErrors {
  const errors: ForgotPasswordFormErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = i18n.t('validation.emailRequired');
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = i18n.t('validation.emailInvalid');
  } else if (trimmedEmail.length > 320) {
    errors.email = i18n.t('validation.emailTooLong');
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
    errors.token = i18n.t('validation.resetTokenRequired');
  }

  if (!newPassword) {
    errors.newPassword = i18n.t('validation.passwordRequired');
  } else if (newPassword.length < 8) {
    errors.newPassword = i18n.t('validation.passwordTooShort');
  } else if (newPassword.length > 128) {
    errors.newPassword = i18n.t('validation.passwordTooLong');
  }

  if (!confirmPassword) {
    errors.confirmPassword = i18n.t('validation.confirmPasswordRequired');
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = i18n.t('validation.passwordsDoNotMatch');
  }

  return errors;
}

export function hasValidationErrors(
  errors: LoginFormErrors | RegisterFormErrors | ForgotPasswordFormErrors | ResetPasswordFormErrors,
): boolean {
  return Object.values(errors).some(Boolean);
}
