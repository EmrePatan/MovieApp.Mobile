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

    expect(selectFeaturedItem(sections, true)?.id).toBe('recommended');
  });

  it('falls back to Trending for cold-start users', () => {
    const sections = [
      createSection('ContinueWatching', [createItem({ id: 'continue' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended' })]),
      createSection('Trending', [createItem({ id: 'trending', title: 'Trending Title' })]),
      createSection('Popular', [createItem({ id: 'popular', title: 'Popular Title' })]),
    ];

    expect(selectFeaturedItem(sections, false)?.id).toBe('trending');
  });

  it('returns null for empty sections', () => {
    expect(selectFeaturedItem([])).toBeNull();
  });

  it('returns the source section type using hero candidate priority', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended' })]),
    ];

    expect(selectFeaturedSourceSectionType(sections, true)).toBe('RecommendedForYou');
  });
});
