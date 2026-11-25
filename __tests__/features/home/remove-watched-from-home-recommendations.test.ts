import { QueryClient } from '@tanstack/react-query';
import { removeWatchedMovieFromHomeRecommendations } from '@/features/home/utils/remove-watched-from-home-recommendations';
import type { HomeItem, HomePersonalizedResponse, HomeSection } from '@/features/home/types';

function item(id: string, contentType: 'movie' | 'tv' = 'movie'): HomeItem {
  return { id, contentType, title: id } as HomeItem;
}

function section(type: string, items: HomeItem[]): HomeSection {
  return { type, title: type, items, displayOrder: 1 };
}

describe('removeWatchedMovieFromHomeRecommendations', () => {
  it('drops the movie from recommended-for-you only', () => {
    const queryClient = new QueryClient();
    const key = ['home', 'personalized', 'user-1', 'all', 10, 'TR'] as const;
    const response: HomePersonalizedResponse = {
      isPersonalized: true,
      generatedAtUtc: '2026-11-25T10:00:00Z',
      sections: [
        section('RecommendedForYou', [item('a'), item('b'), item('a', 'tv')]),
        section('ComingUp', [item('a')]),
      ],
    };
    queryClient.setQueryData(key, response);

    removeWatchedMovieFromHomeRecommendations(queryClient, 'a');

    const next = queryClient.getQueryData<HomePersonalizedResponse>(key)!;
    expect(next.sections[0].items.map((entry) => `${entry.contentType}:${entry.id}`)).toEqual([
      'movie:b',
      'tv:a',
    ]);
    expect(next.sections[1].items).toHaveLength(1);
  });

  it('leaves untouched caches and missing data alone', () => {
    const queryClient = new QueryClient();
    const key = ['home', 'personalized', 'user-1', 'all', 10, 'TR'] as const;
    const response: HomePersonalizedResponse = {
      isPersonalized: true,
      generatedAtUtc: '2026-11-25T10:00:00Z',
      sections: [section('RecommendedForYou', [item('b')])],
    };
    queryClient.setQueryData(key, response);

    removeWatchedMovieFromHomeRecommendations(queryClient, 'a');

    expect(queryClient.getQueryData(key)).toBe(response);
    expect(() => removeWatchedMovieFromHomeRecommendations(new QueryClient(), 'a')).not.toThrow();
  });
});
