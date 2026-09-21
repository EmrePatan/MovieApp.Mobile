import * as Linking from 'expo-linking';
import {
  captureAuthDeepLink,
  consumePendingAuthDeepLink,
  ensureAuthDeepLinkListener,
  hasPendingAuthDeepLink,
  isAuthDeepLinkRestorePending,
  markAuthDeepLinkRestoreComplete,
  resetPendingAuthDeepLinkForTests,
} from '@/auth/pending-auth-deep-link';

describe('pending-auth-deep-link', () => {
  beforeEach(() => {
    resetPendingAuthDeepLinkForTests();
  });

  it('captures and consumes verify-email deep links', () => {
    captureAuthDeepLink('movieapp://verify-email?token=abc123');

    expect(hasPendingAuthDeepLink()).toBe(true);
    expect(consumePendingAuthDeepLink()).toEqual({
      kind: 'verify-email',
      token: 'abc123',
    });
    expect(hasPendingAuthDeepLink()).toBe(false);
  });

  it('captures and consumes reset-password deep links', () => {
    captureAuthDeepLink('movieapp://reset-password?token=reset-token');

    expect(hasPendingAuthDeepLink()).toBe(true);
    expect(consumePendingAuthDeepLink()).toEqual({
      kind: 'reset-password',
      token: 'reset-token',
    });
    expect(hasPendingAuthDeepLink()).toBe(false);
  });

  it('ignores unrelated URLs', () => {
    captureAuthDeepLink('movieapp://movie/123');

    expect(hasPendingAuthDeepLink()).toBe(false);
  });

  it('keeps restore pending after consume until navigation completes', () => {
    captureAuthDeepLink('movieapp://verify-email?token=abc123');

    consumePendingAuthDeepLink();

    expect(hasPendingAuthDeepLink()).toBe(false);
    expect(isAuthDeepLinkRestorePending()).toBe(true);

    markAuthDeepLinkRestoreComplete();

    expect(isAuthDeepLinkRestorePending()).toBe(false);
  });

  it('reads launch URLs synchronously from getLinkingURL', () => {
    (Linking.getLinkingURL as jest.Mock).mockReturnValue(
      'movieapp://reset-password?token=sync-token',
    );

    ensureAuthDeepLinkListener();

    expect(hasPendingAuthDeepLink()).toBe(true);
    expect(consumePendingAuthDeepLink()).toEqual({
      kind: 'reset-password',
      token: 'sync-token',
    });
  });
});
