import { useQueries } from '@tanstack/react-query';
import { getBrowseDiscovery } from '@/features/discovery/api/discovery-api';
import {
  GENRE_COVER_CANDIDATE_PAGE_SIZE,
  genreCoverCandidatesFromItems,
  resolveGenreCoverSlots,
  type GenreCoverSlot,
  type GenreCoverSource,
} from '@/features/discovery/genre-cover-selection';
import { genreCoverCandidatesQueryKey } from '@/features/discovery/hooks/discovery-query-keys';
import type { Genre } from '@/features/discovery/types';
import { createDefaultDiscoveryFilters } from '@/features/discovery/types';

const GENRE_COVER_STALE_MS = 10 * 60 * 1000;

export function useGenreCoverSlots(genres: readonly Genre[]): Map<string, GenreCoverSlot> {
  const genreIds = genres.map((genre) => genre.id);
  const queries = useQueries({
    queries: genreIds.map((genreId) => ({
      queryKey: genreCoverCandidatesQueryKey(genreId),
      enabled: genreId.trim().length > 0,
      staleTime: GENRE_COVER_STALE_MS,
      queryFn: ({ signal }: { signal: AbortSignal }) => {
        const filters = createDefaultDiscoveryFilters('popular');
        return getBrowseDiscovery(
          {
            ...filters,
            mode: 'popular',
            type: 'all',
            page: 1,
            pageSize: GENRE_COVER_CANDIDATE_PAGE_SIZE,
            genreIds: [genreId],
          },
          signal,
        );
      },
    })),
  });

  const sources = new Map<string, GenreCoverSource>();
  genres.forEach((genre, index) => {
    const query = queries[index];
    sources.set(genre.id, {
      isLoading: Boolean(query?.isLoading),
      candidates: genreCoverCandidatesFromItems(query?.data?.items),
    });
  });

  return resolveGenreCoverSlots(genres, sources);
}
