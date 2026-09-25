import { buildLibraryActionsPath } from '@/features/library-actions/api/routes';

describe('buildLibraryActionsPath', () => {
  const contentId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('builds movie action status path with catalog content id', () => {
    expect(buildLibraryActionsPath('movie', contentId)).toBe(
      `/api/library/actions?mediaType=movie&contentId=${contentId}`,
    );
  });

  it('includes episodeId for tv watched semantics when provided', () => {
    const episodeId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(buildLibraryActionsPath('tv', contentId, episodeId)).toBe(
      `/api/library/actions?mediaType=tv&contentId=${contentId}&episodeId=${episodeId}`,
    );
  });
});
