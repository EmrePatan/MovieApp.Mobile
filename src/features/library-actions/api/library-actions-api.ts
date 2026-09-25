import { api } from '@/api/client';
import { buildLibraryActionsPath } from './routes';
import type { LibraryActionMediaType, LibraryActionStatusResponse } from '../types';

export async function getLibraryActionStatus(
  mediaType: LibraryActionMediaType,
  contentId: string,
  signal?: AbortSignal,
  episodeId?: string,
): Promise<LibraryActionStatusResponse> {
  return api.get<LibraryActionStatusResponse>(
    buildLibraryActionsPath(mediaType, contentId, episodeId),
    { signal },
  );
}
