import type { SocialAuthProvider } from '@/models/api/auth';
import type { UserProfileResponse } from '../types';

export type DeleteAccountConfirmationMethod = 'password' | 'social';

export function getDeleteAccountConfirmationMethod(
  profile: UserProfileResponse,
): DeleteAccountConfirmationMethod {
  return profile.hasPassword ? 'password' : 'social';
}

export function getDeleteAccountSocialProviders(
  profile: UserProfileResponse,
): SocialAuthProvider[] {
  return profile.linkedProviders;
}
