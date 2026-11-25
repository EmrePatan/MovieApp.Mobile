import {
  getHomeRecommendationDismissKey,
  omitDismissedRecommendations,
} from '@/features/home/utils/omit-dismissed-recommendations';
import type { HomeItem, HomeSection } from '@/features/home/types';

function createItem(id: string, contentType: HomeItem['contentType'] = 'movie'): HomeItem {
  return {
    id,
    contentType,
    title: `Title ${id}`,
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 0,
  } as HomeItem;
}

function createSection(type: HomeSection['type'], items: HomeItem[]): HomeSection {
  return { type, title: type, items, displayOrder: 0 };
}

describe('omitDismissedRecommendations', () => {
  it('returns the same sections when nothing was dismissed', () => {
    const sections = [createSection('RecommendedForYou', [createItem('a')])];

    expect(omitDismissedRecommendations(sections, new Set())).toBe(sections);
  });

  it('removes dismissed titles from RecommendedForYou only', () => {
    const recommended = createSection('RecommendedForYou', [
      createItem('a'),
      createItem('b'),
    ]);
    const trending = createSection('Trending', [createItem('a')]);
    const dismissed = new Set([getHomeRecommendationDismissKey(createItem('a'))]);

    const result = omitDismissedRecommendations([recommended, trending], dismissed);

    expect(result[0]?.items.map((item) => item.id)).toEqual(['b']);
    expect(result[1]).toBe(trending);
  });

  it('keeps the same movie id distinct from a TV show with the same id', () => {
    const recommended = createSection('RecommendedForYou', [
      createItem('same', 'tv'),
      createItem('same', 'movie'),
    ]);
    const dismissed = new Set([getHomeRecommendationDismissKey(createItem('same', 'movie'))]);

    const result = omitDismissedRecommendations([recommended], dismissed);

    expect(result[0]?.items.map((item) => item.contentType)).toEqual(['tv']);
  });

  it('keeps unchanged RecommendedForYou sections by reference', () => {
    const recommended = createSection('RecommendedForYou', [createItem('a')]);
    const dismissed = new Set([getHomeRecommendationDismissKey(createItem('zzz'))]);

    const result = omitDismissedRecommendations([recommended], dismissed);

    expect(result[0]).toBe(recommended);
  });
});
