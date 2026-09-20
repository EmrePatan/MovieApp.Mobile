import {
  getDeleteAccountConfirmationMethod,
  getDeleteAccountSocialProviders,
} from '@/features/profile/utils/delete-account-confirmation';
import type { UserProfileResponse } from '@/features/profile/types';

const passwordProfile: UserProfileResponse = {
  id: 'user-id',
  email: 'user@example.com',
  userName: 'user',
  displayName: 'User',
  createdAt: '2026-01-01T00:00:00.000Z',
  hasPassword: true,
  linkedProviders: ['google'],
};

const socialProfile: UserProfileResponse = {
  ...passwordProfile,
  hasPassword: false,
  linkedProviders: ['google', 'apple'],
};

describe('delete account confirmation helpers', () => {
  it('uses password confirmation for password accounts', () => {
    expect(getDeleteAccountConfirmationMethod(passwordProfile)).toBe('password');
  });

  it('uses social confirmation for social-only accounts', () => {
    expect(getDeleteAccountConfirmationMethod(socialProfile)).toBe('social');
  });

  it('returns all linked providers for social-only accounts', () => {
    expect(getDeleteAccountSocialProviders(socialProfile)).toEqual(['google', 'apple']);
  });
});
