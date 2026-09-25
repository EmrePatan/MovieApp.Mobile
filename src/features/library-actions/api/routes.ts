import type { LibraryActionMediaType } from '../types';

export function buildLibraryActionsPath(
  mediaType: LibraryActionMediaType,
  contentId: string,
  episodeId?: string,
): string {
  const params = new URLSearchParams({
    mediaType,
    contentId,
  });

  if (episodeId) {
    params.set('episodeId', episodeId);
  }

  return `/api/library/actions?${params.toString()}`;
}
