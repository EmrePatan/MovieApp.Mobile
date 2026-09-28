export interface WatchlistShareUrlCarrier {
  shareUrl?: string | null;
  ShareUrl?: string | null;
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
