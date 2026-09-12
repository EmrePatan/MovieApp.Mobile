import { presentHomeSections } from '@/features/home/utils/present-home-sections';
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

describe('presentHomeSections', () => {
  it('removes the featured item from its source rail', () => {
    const featured = createItem({ id: 'featured-id', title: 'Featured Title' });
    const sections = [
      createSection(
        'ContinueWatching',
        [featured, createItem({ id: 'other-id', title: 'Other Title' })],
      ),
      createSection('Trending', [createItem({ id: 'trending-id', title: 'Trending Title' })]),
    ];

    const presented = presentHomeSections(sections);

    expect(presented.featuredItem?.id).toBe('featured-id');
    expect(presented.featuredSourceType).toBe('ContinueWatching');
    expect(presented.sections[0].items.map((item) => item.id)).toEqual(['other-id']);
    expect(presented.sections[1].items.map((item) => item.id)).toEqual(['trending-id']);
  });

  it('omits a rail that only contained the featured item', () => {
    const featured = createItem({ id: 'featured-id', title: 'Featured Title' });
    const sections = [
      createSection('ContinueWatching', [featured]),
      createSection('Trending', [createItem({ id: 'trending-id', title: 'Trending Title' })]),
    ];

    const presented = presentHomeSections(sections);

    expect(presented.sections).toHaveLength(1);
    expect(presented.sections[0].type).toBe('Trending');
  });

  it('does not remove featured items from non-source rails', () => {
    const featured = createItem({ id: 'shared-id', title: 'Shared Title' });
    const sections = [
      createSection('ContinueWatching', [featured]),
      createSection('Trending', [featured, createItem({ id: 'unique-id', title: 'Unique' })]),
    ];

    const presented = presentHomeSections(sections);

    expect(presented.sections).toHaveLength(1);
    expect(presented.sections[0].type).toBe('Trending');
    expect(presented.sections[0].items.map((item) => item.id)).toEqual(['shared-id', 'unique-id']);
  });
});
