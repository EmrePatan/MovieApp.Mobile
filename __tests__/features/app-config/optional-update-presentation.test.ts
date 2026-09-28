import {
  canOpenOptionalUpdate,
  shouldDismissOptionalUpdate,
} from '@/features/app-config/optional-update-presentation';

describe('optional update presentation', () => {
  it('dismisses when update prompt is not optional', () => {
    expect(shouldDismissOptionalUpdate('none', 'https://example.com')).toBe(true);
    expect(shouldDismissOptionalUpdate('optional', null)).toBe(true);
  });

  it('allows opening when evaluation is optional and persisted reminder allows', () => {
    expect(
      canOpenOptionalUpdate({
        updatePrompt: 'optional',
        storeUrl: 'https://example.com',
        isAlreadyVisible: false,
        dismissedThisSession: false,
        sessionSuppressed: false,
        persistedAllowsShow: true,
      }),
    ).toBe(true);
  });

  it('keeps already visible banner open when session becomes suppressed', () => {
    expect(
      canOpenOptionalUpdate({
        updatePrompt: 'optional',
        storeUrl: 'https://example.com',
        isAlreadyVisible: true,
        dismissedThisSession: false,
        sessionSuppressed: true,
        persistedAllowsShow: false,
      }),
    ).toBe(true);
  });

  it('blocks re-presenting when session is suppressed and banner is not visible', () => {
    expect(
      canOpenOptionalUpdate({
        updatePrompt: 'optional',
        storeUrl: 'https://example.com',
        isAlreadyVisible: false,
        dismissedThisSession: false,
        sessionSuppressed: true,
        persistedAllowsShow: true,
      }),
    ).toBe(false);
  });

  it('blocks opening when user dismissed in this session', () => {
    expect(
      canOpenOptionalUpdate({
        updatePrompt: 'optional',
        storeUrl: 'https://example.com',
        isAlreadyVisible: false,
        dismissedThisSession: true,
        sessionSuppressed: false,
        persistedAllowsShow: true,
      }),
    ).toBe(false);
  });

  it('blocks opening when persisted Later dismissal is within 24h', () => {
    expect(
      canOpenOptionalUpdate({
        updatePrompt: 'optional',
        storeUrl: 'https://example.com',
        isAlreadyVisible: false,
        dismissedThisSession: false,
        sessionSuppressed: false,
        persistedAllowsShow: false,
      }),
    ).toBe(false);
  });
});
