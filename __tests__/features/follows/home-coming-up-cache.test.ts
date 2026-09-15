import { QueryClient } from '@tanstack/react-query';
import { HOME_QUERY_KEY_ROOT } from '@/features/home/hooks/home-query-keys';
import type { HomeResponse } from '@/features/home/types';
import { removeFollowedCatalogFromHomeCaches } from '@/features/follows/utils/home-coming-up-cache';

const homeData: HomeResponse = {
  isPersonalized: false,
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
    queryClient.setQueryData([...HOME_QUERY_KEY_ROOT, 'all', 10], homeData);

    removeFollowedCatalogFromHomeCaches(queryClient, 'movie-id');

    const updated = queryClient.getQueryData<HomeResponse>([...HOME_QUERY_KEY_ROOT, 'all', 10]);
    expect(updated?.sections).toHaveLength(2);
    expect(updated?.sections[0]?.type).toBe('ComingUp');
    expect(updated?.sections[0]?.items).toHaveLength(1);
    expect(updated?.sections[0]?.items[0]?.id).toBe('tv-id');
  });

  it('removes Coming Up entirely when the last item is unfollowed', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData([...HOME_QUERY_KEY_ROOT, 'all', 10], {
      ...homeData,
      sections: [
        {
          ...homeData.sections[0],
          items: [homeData.sections[0].items[0]],
        },
      ],
    });

    removeFollowedCatalogFromHomeCaches(queryClient, 'movie-id');

    const updated = queryClient.getQueryData<HomeResponse>([...HOME_QUERY_KEY_ROOT, 'all', 10]);
    expect(updated?.sections).toHaveLength(0);
  });
});
