import {
  presentHomeSections,
  RECOMMENDED_HERO_DEDUPE_MIN_COUNT,
} from '@/features/home/utils/present-home-sections';
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
  it('builds hero from Hot This Week and keeps full Recommended rail', () => {
    const heroItem = createItem({ id: 'hero-id' });
    const recommendedItems = Array.from({ length: 10 }, (_, index) =>
      createItem({ id: `rec-${index + 1}` }),
    );

    const sections = [
      createSection('HotThisWeek', [heroItem]),
      createSection('RecommendedForYou', [heroItem, ...recommendedItems.slice(1)]),
      createSection('TopRated', [createItem({ id: 'top-id' })]),
    ];

    const presented = presentHomeSections(sections, true);

    expect(presented.heroItems.map((item) => item.id)).toEqual(['hero-id']);
    expect(presented.sections.map((section) => section.type)).toEqual(['RecommendedForYou']);
    expect(presented.sections[0].items).toHaveLength(10);
  });

  it('drops hero overlap from Recommended only when ten non-hero cards remain', () => {
    const heroItems = Array.from({ length: 3 }, (_, index) =>
      createItem({ id: `hero-${index + 1}` }),
    );
    const extraRecommended = Array.from({ length: 12 }, (_, index) =>
      createItem({ id: `rec-${index + 1}` }),
    );
    const shortRecommended = Array.from({ length: 4 }, (_, index) =>
      createItem({ id: `short-${index + 1}` }),
    );

    const deduped = presentHomeSections(
      [
        createSection('HotThisWeek', heroItems),
        createSection('RecommendedForYou', [...heroItems, ...extraRecommended]),
      ],
      true,
    );
    expect(deduped.sections[0].items.map((item) => item.id)).toEqual(
      extraRecommended.slice(0, RECOMMENDED_HERO_DEDUPE_MIN_COUNT).map((item) => item.id),
    );

    const kept = presentHomeSections(
      [
        createSection('HotThisWeek', heroItems),
        createSection('RecommendedForYou', [...heroItems, ...shortRecommended]),
      ],
      true,
    );
    expect(kept.sections[0].items.map((item) => item.id)).toEqual(
      [...heroItems, ...shortRecommended].map((item) => item.id),
    );
  });

  it('orders cold-start rails without Popular, New Releases, or Top Rated', () => {
    const sections = [
      createSection('HotThisWeek', [createItem({ id: 'hot-id' })]),
      createSection('NewReleases', [createItem({ id: 'new-id' })]),
      createSection('TopRated', [createItem({ id: 'top-id' })]),
      createSection('Popular', [createItem({ id: 'popular-id' })]),
      createSection('NowInTheaters', [createItem({ id: 'theater-id' })]),
      createSection('OnTvThisWeek', [createItem({ id: 'tv-id', contentType: 'tv' })]),
      createSection('Trending', [createItem({ id: 'trending-id' })]),
    ];

    const presented = presentHomeSections(sections, false);

    expect(presented.showColdWelcome).toBe(false);
    expect(presented.heroItems.map((item) => item.id)).toEqual(['hot-id']);
    expect(presented.sections.map((section) => section.type)).toEqual([
      'Trending',
      'OnTvThisWeek',
      'NowInTheaters',
    ]);
  });

  it('orders personalized rails with Trending after Recommended For You', () => {
    const sections = [
      createSection('HotThisWeek', [createItem({ id: 'hot-id' })]),
      createSection('RecommendedForYou', [createItem({ id: 'rec-id' })]),
      createSection('Trending', [createItem({ id: 'trending-id' })]),
      createSection('TopRated', [createItem({ id: 'top-id' })]),
      createSection('NewReleases', [createItem({ id: 'new-id' })]),
      createSection('BecauseYouWatched', [createItem({ id: 'because-id' })]),
    ];

    const presented = presentHomeSections(sections, true);

    expect(presented.sections.map((section) => section.type)).toEqual([
      'RecommendedForYou',
      'Trending',
    ]);
  });

  it('shows cold welcome only when cold user has no hero items', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending-id' })]),
      createSection('TopRated', [createItem({ id: 'top-id' })]),
    ];

    const presented = presentHomeSections(sections, false);

    expect(presented.showColdWelcome).toBe(true);
    expect(presented.heroItems).toEqual([]);
  });

  it('does not show cold welcome while personalization is unknown', () => {
    const sections = [
      createSection('HotThisWeek', [createItem({ id: 'hot-id' })]),
      createSection('Trending', [createItem({ id: 'trending-id' })]),
    ];

    const presented = presentHomeSections(sections, 'unknown');

    expect(presented.showColdWelcome).toBe(false);
    expect(presented.heroItems.map((item) => item.id)).toEqual(['hot-id']);
  });

  it('excludes Continue Watching and Because You Watched from visible sections', () => {
    const sections = [
      createSection('ContinueWatching', [createItem({ id: 'continue-id', contentType: 'tv' })]),
      createSection('BecauseYouWatched', [createItem({ id: 'because-id' })]),
      createSection('HotThisWeek', [createItem({ id: 'hot-id' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended-id' })]),
    ];

    const presented = presentHomeSections(sections, true);

    expect(presented.heroItems.map((item) => item.id)).toEqual(['hot-id']);
    expect(presented.sections.some((section) => section.type === 'ContinueWatching')).toBe(false);
    expect(presented.sections.some((section) => section.type === 'BecauseYouWatched')).toBe(false);
  });
});
