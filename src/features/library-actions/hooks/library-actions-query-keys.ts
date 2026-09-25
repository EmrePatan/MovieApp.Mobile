import type { LibraryActionMediaType } from '../types';

export function libraryActionStatusQueryKey(
  mediaType: LibraryActionMediaType,
  contentId: string,
  episodeId?: string,
) {
  return ['library', 'actions', mediaType, contentId, episodeId ?? ''] as const;
}
