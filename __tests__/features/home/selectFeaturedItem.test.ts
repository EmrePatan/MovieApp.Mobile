import {
  selectFeaturedItem,
  selectFeaturedSourceSectionType,
} from '@/features/home/utils/selectFeaturedItem';
import type { HomeItem, HomeSection } from '@/features/home/types';

function createItem(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: 'item-id',
    contentType: 'movie',
    title: 'Test Title',
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7.5,
    voteCount: 100,
    ...overrides,
  };
}

function createSection(
  type: HomeSection['type'],
  items: HomeItem[],
  displayOrder = 1,
): HomeSection {
  return {
    type,
    title: String(type),
    items,
    displayOrder,
  };
}

describe('selectFeaturedItem', () => {
  it('ignores ContinueWatching for hero selection', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending', title: 'Trending Title' })]),
      createSection(
        'ContinueWatching',
        [createItem({ id: 'continue', title: 'Continue Title' })],
      ),
      createSection(
        'RecommendedForYou',
        [createItem({ id: 'recommended', title: 'Recommended Title' })],
      ),
    ];

    expect(selectFeaturedItem(sections)?.id).toBe('recommended');
  });

  it('falls back to RecommendedForYou when ContinueWatching is empty', () => {
    const sections = [
      createSection('ContinueWatching', []),
      createSection(
        'RecommendedForYou',
        [createItem({ id: 'recommended', title: 'Recommended Title' })],
      ),
      createSection('Trending', [createItem({ id: 'trending', title: 'Trending Title' })]),
    ];

    expect(selectFeaturedItem(sections)?.id).toBe('recommended');
  });

  it('falls back to Trending when recommended is empty', () => {
    const sections = [
      createSection('ContinueWatching', []),
      createSection('RecommendedForYou', []),
      createSection('Trending', [createItem({ id: 'trending', title: 'Trending Title' })]),
      createSection('Popular', [createItem({ id: 'popular', title: 'Popular Title' })]),
    ];

    expect(selectFeaturedItem(sections)?.id).toBe('trending');
  });

  it('returns null for empty sections', () => {
    expect(selectFeaturedItem([])).toBeNull();
  });

  it('returns the source section type using hero candidate priority', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended' })]),
    ];

    expect(selectFeaturedSourceSectionType(sections)).toBe('RecommendedForYou');
  });
});
