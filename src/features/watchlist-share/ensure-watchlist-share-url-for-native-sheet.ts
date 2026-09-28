import { pickWatchlistShareUrl, type WatchlistShareUrlCarrier } from './pick-watchlist-share-url';

export interface WatchlistShareStatusCarrier {
  isSharingEnabled?: boolean;
  IsSharingEnabled?: boolean;
}

export function pickWatchlistShareStatusEnabled(
  response: WatchlistShareStatusCarrier | null | undefined,
): boolean {
  if (!response) {
    return false;
  }

  return Boolean(response.isSharingEnabled ?? response.IsSharingEnabled);
}

export type EnsureWatchlistShareUrlDeps = {
  getStatus: (watchlistId: string) => Promise<WatchlistShareStatusCarrier>;
  enableShare: (watchlistId: string) => Promise<WatchlistShareUrlCarrier>;
  rotateShare: (watchlistId: string) => Promise<WatchlistShareUrlCarrier>;
};

/**
 * Resolves a shareable HTTPS URL for the OS share sheet.
 * When sharing is already on, rotates the link (same as "new link") so the client always gets a token-backed URL.
 */
export async function ensureWatchlistShareUrlForNativeSheet(
  watchlistId: string,
  deps: EnsureWatchlistShareUrlDeps,
): Promise<string> {
  const status = await deps.getStatus(watchlistId);

  if (pickWatchlistShareStatusEnabled(status)) {
    const rotatedUrl = pickWatchlistShareUrl(await deps.rotateShare(watchlistId));
    if (rotatedUrl) {
      return rotatedUrl;
    }

    const enabledAfterRotateFailure = pickWatchlistShareUrl(await deps.enableShare(watchlistId));
    if (enabledAfterRotateFailure) {
      return enabledAfterRotateFailure;
    }

    throw new Error('watchlist-share-missing-url-after-rotate');
  }

  const enabledUrl = pickWatchlistShareUrl(await deps.enableShare(watchlistId));
  if (enabledUrl) {
    return enabledUrl;
  }

  throw new Error('watchlist-share-missing-url-after-enable');
}
