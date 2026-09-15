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
  it('uses Hot This Week for hero selection', () => {
    const sections = [
      createSection('HotThisWeek', [createItem({ id: 'hot', title: 'Hot Title' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended', title: 'Recommended Title' })]),
    ];

    expect(selectFeaturedItem(sections, true)?.id).toBe('hot');
  });

  it('returns Hot This Week for cold-start hero carousel', () => {
    const sections = [
      createSection('HotThisWeek', [createItem({ id: 'hot', title: 'Hot Title' })]),
      createSection('TopRated', [createItem({ id: 'top', title: 'Top Title' })]),
    ];

    expect(selectFeaturedItem(sections, false)?.id).toBe('hot');
  });

  it('returns null for empty sections', () => {
    expect(selectFeaturedItem([])).toBeNull();
  });

  it('returns the source section type using hero candidate priority', () => {
    const sections = [
      createSection('HotThisWeek', [createItem({ id: 'hot' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended' })]),
    ];

    expect(selectFeaturedSourceSectionType(sections, true)).toBe('HotThisWeek');
  });
});
