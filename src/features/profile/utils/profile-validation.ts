import { i18n } from '@/i18n';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UpdateProfileFormErrors {
  displayName?: string;
}

export interface ChangeEmailFormErrors {
  email?: string;
  currentPassword?: string;
}

export interface ChangePasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface DeleteAccountFormErrors {
  currentPassword?: string;
}

export function validateUpdateProfile(displayName: string): UpdateProfileFormErrors {
  const errors: UpdateProfileFormErrors = {};
  const trimmed = displayName.trim();

  if (!trimmed) {
    errors.displayName = i18n.t('validation.displayNameRequired');
  } else if (trimmed.length > 100) {
    errors.displayName = i18n.t('validation.displayNameTooLong');
  }

  return errors;
}

export function validateChangeEmail(
  email: string,
  currentPassword: string,
): ChangeEmailFormErrors {
  const errors: ChangeEmailFormErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = i18n.t('validation.emailRequired');
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = i18n.t('validation.emailInvalid');
  } else if (trimmedEmail.length > 320) {
    errors.email = i18n.t('validation.emailTooLong');
  }

  if (!currentPassword) {
    errors.currentPassword = i18n.t('validation.currentPasswordRequired');
  }

  return errors;
}

export function validateChangePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): ChangePasswordFormErrors {
  const errors: ChangePasswordFormErrors = {};

  if (!currentPassword) {
    errors.currentPassword = i18n.t('validation.currentPasswordRequired');
  }

  if (!newPassword) {
    errors.newPassword = i18n.t('validation.newPasswordRequired');
  } else if (newPassword.length < 8) {
    errors.newPassword = i18n.t('validation.newPasswordTooShort');
  } else if (newPassword.length > 128) {
    errors.newPassword = i18n.t('validation.newPasswordTooLong');
  } else if (newPassword === currentPassword) {
    errors.newPassword = i18n.t('validation.newPasswordMustDiffer');
  }

  if (!confirmPassword) {
    errors.confirmPassword = i18n.t('validation.confirmNewPasswordRequired');
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = i18n.t('validation.passwordsDoNotMatch');
  }

  return errors;
}

export function validateDeleteAccount(currentPassword: string): DeleteAccountFormErrors {
  const errors: DeleteAccountFormErrors = {};

  if (!currentPassword) {
    errors.currentPassword = i18n.t('validation.currentPasswordRequired');
  }

  return errors;
}

export function hasProfileValidationErrors(
  errors:
    | UpdateProfileFormErrors
    | ChangeEmailFormErrors
    | ChangePasswordFormErrors
    | DeleteAccountFormErrors,
): boolean {
  return Object.values(errors).some(Boolean);
}
