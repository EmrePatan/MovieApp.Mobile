import { QueryClient } from '@tanstack/react-query';
import { homePersonalizedQueryKey } from '@/features/home/hooks/useHomePersonalized';
import type { HomePersonalizedResponse } from '@/features/home/types';
import { removeFollowedCatalogFromHomeCaches } from '@/features/follows/utils/home-coming-up-cache';

const homeData: HomePersonalizedResponse = {
  isPersonalized: true,
  generatedAtUtc: '2026-01-01T00:00:00Z',
  sections: [
    {
      type: 'ComingUp',
      title: 'Coming Up',
      displayOrder: 1,
      items: [
        {
          id: 'movie-id',
          contentType: 'movie',
          title: 'Future Movie',
          originalTitle: null,
          posterUrl: null,
          backdropUrl: null,
          releaseDate: '2026-12-01',
          voteAverage: 0,
          voteCount: 0,
          upcomingKind: 'MovieRelease',
        },
        {
          id: 'tv-id',
          contentType: 'tv',
          title: 'Followed Show',
          originalTitle: null,
          posterUrl: null,
          backdropUrl: null,
          releaseDate: '2026-09-20',
          voteAverage: 0,
          voteCount: 0,
          upcomingKind: 'TvEpisode',
        },
      ],
    },
    {
      type: 'Trending',
      title: 'Trending Now',
      displayOrder: 2,
      items: [
        {
          id: 'trending-id',
          contentType: 'movie',
          title: 'Trending Movie',
          originalTitle: null,
          posterUrl: null,
          backdropUrl: null,
          releaseDate: null,
          voteAverage: 8,
          voteCount: 100,
        },
      ],
    },
  ],
};

describe('removeFollowedCatalogFromHomeCaches', () => {
  it('removes the unfollowed item from Coming Up and drops the section when empty', () => {
    const queryClient = new QueryClient();
    const queryKey = homePersonalizedQueryKey('user-1', 'all', 10, 'TR');
    queryClient.setQueryData(queryKey, homeData);

    removeFollowedCatalogFromHomeCaches(queryClient, 'movie-id');

    const updated = queryClient.getQueryData<HomePersonalizedResponse>(queryKey);
    expect(updated?.sections).toHaveLength(2);
    expect(updated?.sections[0]?.type).toBe('ComingUp');
    expect(updated?.sections[0]?.items).toHaveLength(1);
    expect(updated?.sections[0]?.items[0]?.id).toBe('tv-id');
  });

  it('removes Coming Up entirely when the last item is unfollowed', () => {
    const queryClient = new QueryClient();
    const queryKey = homePersonalizedQueryKey('user-1', 'all', 10, 'TR');
    queryClient.setQueryData(queryKey, {
      ...homeData,
      sections: [
        {
          ...homeData.sections[0],
          items: [homeData.sections[0].items[0]],
        },
      ],
    });

    removeFollowedCatalogFromHomeCaches(queryClient, 'movie-id');

    const updated = queryClient.getQueryData<HomePersonalizedResponse>(queryKey);
    expect(updated?.sections).toHaveLength(0);
  });
});
