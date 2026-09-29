import {
  canUnlinkProvider,
  countUsableSignInMethods,
  getConnectableProviders,
} from '@/features/profile/utils/sign-in-methods';
import type { UserProfileResponse } from '@/features/profile/types';

const baseProfile: UserProfileResponse = {
  id: '1',
  email: 'user@example.com',
  userName: 'user',
  displayName: 'User',
  createdAt: '2024-01-01T00:00:00Z',
  hasPassword: false,
  linkedProviders: ['google'],
};

describe('sign-in method policy', () => {
  it('counts usable methods', () => {
    expect(countUsableSignInMethods({ ...baseProfile, hasPassword: true, linkedProviders: ['google'] })).toBe(2);
    expect(countUsableSignInMethods(baseProfile)).toBe(1);
  });

  it('prevents unlinking the final social method', () => {
    expect(canUnlinkProvider(baseProfile, 'google')).toBe(false);
    expect(
      canUnlinkProvider({ ...baseProfile, linkedProviders: ['google', 'apple'] }, 'google'),
    ).toBe(true);
    expect(
      canUnlinkProvider({ ...baseProfile, hasPassword: true, linkedProviders: ['google'] }, 'google'),
    ).toBe(true);
  });

  it('lists connectable providers', () => {
    expect(getConnectableProviders(baseProfile)).toEqual(['apple']);
    expect(getConnectableProviders({ ...baseProfile, linkedProviders: ['apple'] })).toEqual([
      'google',
    ]);
    expect(
      getConnectableProviders({ ...baseProfile, linkedProviders: ['google', 'apple'] }),
    ).toEqual([]);
  });

  it('allows unlink when password or another provider remains', () => {
    expect(
      canUnlinkProvider({ ...baseProfile, hasPassword: true, linkedProviders: ['google'] }, 'google'),
    ).toBe(true);
    expect(
      canUnlinkProvider({ ...baseProfile, linkedProviders: ['google', 'apple'] }, 'apple'),
    ).toBe(true);
  });
});
