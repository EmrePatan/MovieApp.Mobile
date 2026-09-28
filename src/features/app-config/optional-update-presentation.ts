import type { UpdatePromptKind } from './types';

export function shouldDismissOptionalUpdate(
  updatePrompt: UpdatePromptKind,
  storeUrl: string | null,
): boolean {
  return updatePrompt !== 'optional' || !storeUrl;
}

export function canOpenOptionalUpdate({
  updatePrompt,
  storeUrl,
  isAlreadyVisible,
  dismissedThisSession,
  sessionSuppressed,
  persistedAllowsShow,
}: {
  updatePrompt: UpdatePromptKind;
  storeUrl: string | null;
  isAlreadyVisible: boolean;
  dismissedThisSession: boolean;
  sessionSuppressed: boolean;
  persistedAllowsShow: boolean;
}): boolean {
  if (shouldDismissOptionalUpdate(updatePrompt, storeUrl)) {
    return false;
  }

  if (isAlreadyVisible) {
    return true;
  }

  if (dismissedThisSession || sessionSuppressed) {
    return false;
  }

  return persistedAllowsShow;
}
