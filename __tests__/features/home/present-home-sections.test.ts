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
  it('removes hero candidates from their source rails', () => {
    const featured = createItem({ id: 'featured-id', title: 'Featured Title' });
    const sections = [
      createSection(
        'RecommendedForYou',
        [featured, createItem({ id: 'other-id', title: 'Other Title' })],
      ),
      createSection('Trending', [createItem({ id: 'trending-id', title: 'Trending Title' })]),
    ];

    const presented = presentHomeSections(sections);

    expect(presented.heroItems.map((item) => item.id)).toEqual([
      'featured-id',
      'other-id',
      'trending-id',
    ]);
    expect(presented.sections).toHaveLength(0);
  });

  it('does not promote Continue Watching into the hero', () => {
    const continueItem = createItem({ id: 'continue-id', contentType: 'tv' });
    const recommended = createItem({ id: 'recommended-id' });
    const sections = [
      createSection('ContinueWatching', [continueItem]),
      createSection('RecommendedForYou', [recommended]),
    ];

    const presented = presentHomeSections(sections);

    expect(presented.heroItems.map((item) => item.id)).toEqual(['recommended-id']);
    expect(presented.sections.find((section) => section.type === 'ContinueWatching')?.items).toEqual([
      continueItem,
    ]);
  });

  it('omits a rail that only contained hero candidates', () => {
    const featured = createItem({ id: 'featured-id', title: 'Featured Title' });
    const sections = [
      createSection('RecommendedForYou', [featured]),
      createSection('Trending', [createItem({ id: 'trending-id', title: 'Trending Title' })]),
    ];

    const presented = presentHomeSections(sections);

    expect(presented.sections).toHaveLength(0);
    expect(presented.heroItems.map((item) => item.id)).toEqual(['featured-id', 'trending-id']);
  });

  it('does not remove hero items from non-source rails', () => {
    const shared = createItem({ id: 'shared-id', title: 'Shared Title' });
    const sections = [
      createSection('RecommendedForYou', [
        shared,
        createItem({ id: 'rec-2' }),
        createItem({ id: 'rec-3' }),
      ]),
      createSection('Trending', [shared, createItem({ id: 'unique-id', title: 'Unique' })]),
    ];

    const presented = presentHomeSections(sections);

    expect(presented.heroItems.map((item) => item.id)).toEqual([
      'shared-id',
      'rec-2',
      'rec-3',
      'unique-id',
    ]);
    expect(presented.sections).toHaveLength(1);
    expect(presented.sections[0].type).toBe('Trending');
    expect(presented.sections[0].items.map((item) => item.id)).toEqual(['shared-id']);
  });
});
