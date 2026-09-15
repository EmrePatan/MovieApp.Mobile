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
      createSection('BecauseYouWatched', [createItem({ id: 'because-id', title: 'Because Title' })]),
    ];

    const presented = presentHomeSections(sections, true);

    expect(presented.heroItems.map((item) => item.id)).toEqual(['featured-id', 'other-id']);
    expect(presented.sections).toHaveLength(1);
    expect(presented.sections[0].type).toBe('BecauseYouWatched');
  });

  it('excludes Continue Watching from visible sections', () => {
    const continueItem = createItem({ id: 'continue-id', contentType: 'tv' });
    const recommended = createItem({ id: 'recommended-id' });
    const sections = [
      createSection('ContinueWatching', [continueItem]),
      createSection('RecommendedForYou', [recommended]),
      createSection('Trending', [createItem({ id: 'trending-id' })]),
    ];

    const presented = presentHomeSections(sections, true);

    expect(presented.heroItems.map((item) => item.id)).toEqual(['recommended-id']);
    expect(presented.sections.some((section) => section.type === 'ContinueWatching')).toBe(false);
    expect(presented.sections.some((section) => section.type === 'Trending')).toBe(false);
  });

  it('excludes Popular and Genre sections from visible rails', () => {
    const sections = [
      createSection('Popular', [createItem({ id: 'popular-id' })]),
      createSection('Genre', [createItem({ id: 'genre-id' })]),
      createSection('Trending', [
        createItem({ id: 'trending-id-1' }),
        createItem({ id: 'trending-id-2' }),
        createItem({ id: 'trending-id-3' }),
        createItem({ id: 'trending-id-4' }),
        createItem({ id: 'trending-id-5' }),
        createItem({ id: 'trending-id-6' }),
      ]),
    ];

    const presented = presentHomeSections(sections, false);

    expect(presented.showColdWelcome).toBe(true);
    expect(presented.heroItems).toEqual([]);
    expect(presented.sections.map((section) => section.type)).toEqual(['Trending']);
    expect(presented.sections[0].items).toHaveLength(6);
  });

  it('does not build a cold-start hero carousel', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending-id' })]),
      createSection('NewReleases', [createItem({ id: 'new-id' })]),
    ];

    const presented = presentHomeSections(sections, false);

    expect(presented.heroItems).toEqual([]);
    expect(presented.showColdWelcome).toBe(true);
    expect(presented.sections.map((section) => section.type)).toEqual(['Trending']);
  });
});
