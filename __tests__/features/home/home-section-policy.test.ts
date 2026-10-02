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
  it('orders cold-start sections as Coming Up, week trending, On TV, then theaters', () => {
    const sections = [
      createSection('NowInTheaters', 'Now in Theaters', [createItem({ id: 'theaters' })]),
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
      createSection('NewReleases', 'New Releases', [createItem({ id: 'new' })]),
      createSection('OnTvThisWeek', 'On TV This Week', [
        createItem({ id: 'tv', contentType: 'tv' }),
      ]),
      createSection('Trending', 'Trending Now', [createItem({ id: 'trending' })]),
      createSection('ComingUp', 'Coming Up', [createItem({ id: 'coming' })]),
      createSection('HotThisWeek', 'Hot This Week', [createItem({ id: 'hot' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, false);

    expect(presented.map((section) => section.type)).toEqual([
      'ComingUp',
      'Trending',
      'OnTvThisWeek',
      'NowInTheaters',
    ]);
  });

  it('orders personalized sections and drops legacy home rails', () => {
    const sections = [
      createSection('NowInTheaters', 'Now in Theaters', [createItem({ id: 'theaters' })]),
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
      createSection('BecauseYouWatched', 'Because You Watched', [createItem({ id: 'because' })]),
      createSection('RecommendedForYou', 'Recommended For You', [createItem({ id: 'rec' })]),
      createSection('OnTvThisWeek', 'On TV This Week', [
        createItem({ id: 'tv', contentType: 'tv' }),
      ]),
      createSection('Trending', 'Trending Now', [createItem({ id: 'trending' })]),
      createSection('NewReleases', 'New Releases', [createItem({ id: 'new' })]),
      createSection('Popular', 'Popular', [createItem({ id: 'popular' })]),
      createSection('ComingUp', 'Coming Up', [createItem({ id: 'coming' })]),
      createSection('HotThisWeek', 'Hot This Week', [createItem({ id: 'hot' })]),
      createSection('Genre', 'Action', [createItem({ id: 'genre' })]),
      createSection('ContinueWatching', 'Continue Watching', [createItem({ id: 'continue' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, true);

    expect(presented.map((section) => section.type)).toEqual([
      'RecommendedForYou',
      'ComingUp',
      'Trending',
      'OnTvThisWeek',
      'NowInTheaters',
    ]);
  });

  it('excludes hero and legacy rails from visible sections', () => {
    const sections = [
      createSection('ContinueWatching', 'Continue Watching', [createItem({ id: 'continue' })]),
      createSection('Popular', 'Popular', [createItem({ id: 'popular' })]),
      createSection('Genre', 'Action', [createItem({ id: 'genre' })]),
      createSection('BasedOnFavorites', 'Based On Your Favorites', [
        createItem({ id: 'favorites' }),
      ]),
      createSection('BecauseYouWatched', 'Because You Watched', [createItem({ id: 'because' })]),
      createSection('HotThisWeek', 'Hot This Week', [createItem({ id: 'hot' })]),
      createSection('NewReleases', 'New Releases', [createItem({ id: 'new' })]),
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
      createSection('Trending', 'Trending Now', [createItem({ id: 'trending' })]),
    ];

    const presentedCold = applyHomeSectionPolicy(sections, false);
    const presentedPersonalized = applyHomeSectionPolicy(sections, true);

    expect(presentedCold.map((section) => section.type)).toEqual(['Trending']);
    expect(presentedPersonalized.map((section) => section.type)).toEqual(['Trending']);
  });
});
