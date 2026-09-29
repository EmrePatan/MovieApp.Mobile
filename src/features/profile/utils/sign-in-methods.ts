import type { SocialAuthProvider } from '@/models/api/auth';
import type { UserProfileResponse } from '../types';

const SOCIAL_PROVIDERS: SocialAuthProvider[] = ['google', 'apple'];

export function countUsableSignInMethods(profile: UserProfileResponse): number {
  return (profile.hasPassword ? 1 : 0) + profile.linkedProviders.length;
}

export function canUnlinkProvider(profile: UserProfileResponse, provider: SocialAuthProvider): boolean {
  if (!profile.linkedProviders.includes(provider)) {
    return false;
  }

  const remainingProviders = profile.linkedProviders.filter((entry) => entry !== provider);
  const remainingCount = (profile.hasPassword ? 1 : 0) + remainingProviders.length;
  return remainingCount >= 1;
}

export function isProviderLinked(profile: UserProfileResponse, provider: SocialAuthProvider): boolean {
  return profile.linkedProviders.includes(provider);
}

export function getConnectableProviders(profile: UserProfileResponse): SocialAuthProvider[] {
  return SOCIAL_PROVIDERS.filter((provider) => !profile.linkedProviders.includes(provider));
}
