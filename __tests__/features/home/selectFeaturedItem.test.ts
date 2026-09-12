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
  it('prioritizes ContinueWatching', () => {
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

    expect(selectFeaturedItem(sections)?.id).toBe('continue');
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

  it('falls back to Trending when higher-priority sections are empty', () => {
    const sections = [
      createSection('ContinueWatching', []),
      createSection('RecommendedForYou', []),
      createSection('Trending', [createItem({ id: 'trending', title: 'Trending Title' })]),
      createSection('Popular', [createItem({ id: 'popular', title: 'Popular Title' })]),
    ];

    expect(selectFeaturedItem(sections)?.id).toBe('trending');
  });

  it('falls back to the first available item in section order', () => {
    const sections = [
      createSection('ContinueWatching', []),
      createSection('RecommendedForYou', []),
      createSection('Trending', []),
      createSection('Popular', [createItem({ id: 'popular', title: 'Popular Title' })]),
      createSection('TopRated', [createItem({ id: 'top-rated', title: 'Top Rated Title' })]),
    ];

    expect(selectFeaturedItem(sections)?.id).toBe('popular');
  });

  it('returns null for empty sections', () => {
    expect(selectFeaturedItem([])).toBeNull();
  });

  it('returns the source section type using the same priority order', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended' })]),
    ];

    expect(selectFeaturedSourceSectionType(sections)).toBe('RecommendedForYou');
  });
});
