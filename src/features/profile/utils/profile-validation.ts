import { i18n } from '@/i18n';
import type { ProfileSocialLinks, ProfileSocialPlatform } from '../types';
import {
  PROFILE_BIO_MAX,
  PROFILE_SOCIAL_PLATFORMS,
  isValidSocialDraftValue,
} from './profile-social-links';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UpdateProfileFormErrors {
  displayName?: string;
  bio?: string;
  socialLinks?: Partial<Record<ProfileSocialPlatform, string>>;
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

export function validateUpdateProfile(
  displayName: string,
  bio = '',
  socialDraft?: Partial<Record<ProfileSocialPlatform, string>> | ProfileSocialLinks | null,
): UpdateProfileFormErrors {
  const errors: UpdateProfileFormErrors = {};
  const trimmed = displayName.trim();

  if (!trimmed) {
    errors.displayName = i18n.t('validation.displayNameRequired');
  } else if (trimmed.length > 100) {
    errors.displayName = i18n.t('validation.displayNameTooLong');
  }

  if (bio.length > PROFILE_BIO_MAX) {
    errors.bio = i18n.t('validation.bioTooLong');
  }

  if (socialDraft) {
    const linkErrors: Partial<Record<ProfileSocialPlatform, string>> = {};
    for (const platform of PROFILE_SOCIAL_PLATFORMS) {
      const raw = socialDraft[platform];
      if (raw == null || !String(raw).trim()) continue;
      if (!isValidSocialDraftValue(platform, String(raw))) {
        linkErrors[platform] =
          platform === 'website'
            ? i18n.t('validation.websiteInvalid')
            : i18n.t('validation.socialHandleInvalid');
      }
    }
    if (Object.keys(linkErrors).length > 0) {
      errors.socialLinks = linkErrors;
    }
  }

  return errors;
}

export function validateChangeEmail(
  email: string,
  currentPassword: string,
  currentEmail?: string,
): ChangeEmailFormErrors {
  const errors: ChangeEmailFormErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = i18n.t('validation.emailRequired');
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = i18n.t('validation.emailInvalid');
  } else if (trimmedEmail.length > 320) {
    errors.email = i18n.t('validation.emailTooLong');
  } else if (
    currentEmail &&
    trimmedEmail.localeCompare(currentEmail.trim(), undefined, { sensitivity: 'accent' }) === 0
  ) {
    errors.email = i18n.t('profile.emailUnchanged');
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

export function validateCreatePasswordForm(
  newPassword: string,
  confirmPassword: string,
): ChangePasswordFormErrors {
  const errors: ChangePasswordFormErrors = {};

  if (!newPassword) {
    errors.newPassword = i18n.t('validation.newPasswordRequired');
  } else if (newPassword.length < 8) {
    errors.newPassword = i18n.t('validation.newPasswordTooShort');
  } else if (newPassword.length > 128) {
    errors.newPassword = i18n.t('validation.newPasswordTooLong');
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
  return Object.values(errors).some((value) => {
    if (!value) return false;
    if (typeof value === 'object') {
      return Object.values(value).some(Boolean);
    }
    return true;
  });
}

