export interface WatchlistShareUrlCarrier {
  shareUrl?: string | null;
  ShareUrl?: string | null;
}

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

export function pickWatchlistShareUrl(
  response: WatchlistShareUrlCarrier | null | undefined,
): string | null {
  if (!response) {
    return null;
  }

  const candidate = response.shareUrl ?? response.ShareUrl ?? null;
  if (typeof candidate !== 'string') {
    return null;
  }

  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : null;
}
