import { mergeProgressiveHomeSections } from '@/features/home/utils/merge-progressive-home-sections';

describe('mergeProgressiveHomeSections', () => {
  it('merges browse and personalized sections without duplicates', () => {
    const merged = mergeProgressiveHomeSections(
      {
        sections: [
          {
            type: 'HotThisWeek',
            title: 'Hot This Week',
            displayOrder: 0,
            items: [{ id: '1', contentType: 'movie', title: 'Hot', originalTitle: null, posterUrl: null, backdropUrl: null, releaseDate: null, voteAverage: 8, voteCount: 1 }],
          },
          {
            type: 'Trending',
            title: 'Trending Now',
            displayOrder: 1,
            items: [{ id: '2', contentType: 'movie', title: 'Trending', originalTitle: null, posterUrl: null, backdropUrl: null, releaseDate: null, voteAverage: 8, voteCount: 1 }],
          },
        ],
        generatedAtUtc: '2026-01-01T00:00:00Z',
      },
      {
        sections: [
          {
            type: 'RecommendedForYou',
            title: 'Recommended For You',
            displayOrder: 1,
            items: [{ id: '3', contentType: 'movie', title: 'Rec', originalTitle: null, posterUrl: null, backdropUrl: null, releaseDate: null, voteAverage: 8, voteCount: 1 }],
          },
          {
            type: 'ComingUp',
            title: 'Coming Up',
            displayOrder: 2,
            items: [{ id: '4', contentType: 'tv', title: 'Upcoming', originalTitle: null, posterUrl: null, backdropUrl: null, releaseDate: null, voteAverage: 0, voteCount: 0 }],
          },
        ],
        isPersonalized: true,
        generatedAtUtc: '2026-01-01T00:00:00Z',
      },
    );

    expect(merged.map((section) => section.type)).toEqual([
      'HotThisWeek',
      'Trending',
      'RecommendedForYou',
      'ComingUp',
    ]);
  });
});
