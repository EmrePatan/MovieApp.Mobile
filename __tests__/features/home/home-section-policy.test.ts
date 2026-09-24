import { applyHomeSectionPolicy } from '@/features/home/utils/home-section-policy';
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
  title: string,
  items: HomeItem[],
  displayOrder = 1,
): HomeSection {
  return {
    type,
    title,
    items,
    displayOrder,
  };
}

describe('applyHomeSectionPolicy', () => {
  it('orders cold-start sections with Trending and Top Rated', () => {
    const sections = [
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
      createSection('NewReleases', 'New Releases', [createItem({ id: 'new' })]),
      createSection('Trending', 'Trending Now', [createItem({ id: 'trending' })]),
      createSection('HotThisWeek', 'Hot This Week', [createItem({ id: 'hot' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, false);

    expect(presented.map((section) => section.type)).toEqual(['Trending', 'TopRated']);
  });

  it('orders cold-start sections with Coming Up before Trending when present', () => {
    const sections = [
      createSection('ComingUp', 'Coming Up', [createItem({ id: 'coming' })]),
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
      createSection('Trending', 'Trending Now', [createItem({ id: 'trending' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, false);

    expect(presented.map((section) => section.type)).toEqual([
      'ComingUp',
      'Trending',
      'TopRated',
    ]);
  });

  it('orders personalized sections with recommendation, trending, and browse rails', () => {
    const sections = [
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
      createSection('BecauseYouWatched', 'Because You Watched', [createItem({ id: 'because' })]),
      createSection('RecommendedForYou', 'Recommended For You', [createItem({ id: 'rec' })]),
      createSection('Trending', 'Trending Now', [createItem({ id: 'trending' })]),
      createSection('NewReleases', 'New Releases', [createItem({ id: 'new' })]),
      createSection('HotThisWeek', 'Hot This Week', [createItem({ id: 'hot' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, true);

    expect(presented.map((section) => section.type)).toEqual([
      'RecommendedForYou',
      'Trending',
      'TopRated',
    ]);
  });

  it('orders personalized sections with Coming Up after Recommended For You', () => {
    const sections = [
      createSection('ComingUp', 'Coming Up', [createItem({ id: 'coming' })]),
      createSection('RecommendedForYou', 'Recommended For You', [createItem({ id: 'rec' })]),
      createSection('Trending', 'Trending Now', [createItem({ id: 'trending' })]),
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, true);

    expect(presented.map((section) => section.type)).toEqual([
      'RecommendedForYou',
      'ComingUp',
      'Trending',
      'TopRated',
    ]);
  });

  it('excludes hero and legacy rails from visible sections', () => {
    const sections = [
      createSection('ContinueWatching', 'Continue Watching', [createItem({ id: 'continue' })]),
      createSection('Popular', 'Popular', [createItem({ id: 'popular' })]),
      createSection('Genre', 'Action', [createItem({ id: 'genre' })]),
      createSection('BasedOnFavorites', 'Based On Your Favorites', [createItem({ id: 'favorites' })]),
      createSection('HotThisWeek', 'Hot This Week', [createItem({ id: 'hot' })]),
      createSection('Trending', 'Trending Now', [createItem({ id: 'trending' })]),
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
    ];

    const presentedCold = applyHomeSectionPolicy(sections, false);
    const presentedPersonalized = applyHomeSectionPolicy(sections, true);

    expect(presentedCold.map((section) => section.type)).toEqual(['Trending', 'TopRated']);
    expect(presentedPersonalized.map((section) => section.type)).toEqual(['Trending', 'TopRated']);
  });
});
