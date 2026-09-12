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
    errors.displayName = 'Display name is required.';
  } else if (trimmed.length > 100) {
    errors.displayName = 'Display name must be at most 100 characters.';
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
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  } else if (trimmedEmail.length > 320) {
    errors.email = 'Email must be at most 320 characters.';
  }

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.';
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
    errors.currentPassword = 'Current password is required.';
  }

  if (!newPassword) {
    errors.newPassword = 'New password is required.';
  } else if (newPassword.length < 8) {
    errors.newPassword = 'New password must be at least 8 characters.';
  } else if (newPassword.length > 128) {
    errors.newPassword = 'New password must be at most 128 characters.';
  } else if (newPassword === currentPassword) {
    errors.newPassword = 'New password must differ from your current password.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your new password.';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function validateDeleteAccount(currentPassword: string): DeleteAccountFormErrors {
  const errors: DeleteAccountFormErrors = {};

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.';
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
