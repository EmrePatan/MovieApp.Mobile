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
  it('orders cold-start sections as Trending, New Releases, Top Rated', () => {
    const sections = [
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
      createSection('Trending', 'Trending', [createItem({ id: 'trending' })]),
      createSection('NewReleases', 'New Releases', [createItem({ id: 'new' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, false);

    expect(presented.map((section) => section.type)).toEqual([
      'Trending',
      'NewReleases',
      'TopRated',
    ]);
  });

  it('orders personalized sections with recommendation rails first', () => {
    const sections = [
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
      createSection('BecauseYouWatched', 'Because You Watched', [createItem({ id: 'because' })]),
      createSection('RecommendedForYou', 'Recommended For You', [createItem({ id: 'rec' })]),
      createSection('Trending', 'Trending', [createItem({ id: 'trending' })]),
      createSection('NewReleases', 'New Releases', [createItem({ id: 'new' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, true);

    expect(presented.map((section) => section.type)).toEqual([
      'RecommendedForYou',
      'BecauseYouWatched',
      'Trending',
      'NewReleases',
      'TopRated',
    ]);
  });

  it('excludes Continue Watching, Popular, Genre, and Based On Your Favorites', () => {
    const sections = [
      createSection('ContinueWatching', 'Continue Watching', [createItem({ id: 'continue' })]),
      createSection('Popular', 'Popular', [createItem({ id: 'popular' })]),
      createSection('Genre', 'Action', [createItem({ id: 'genre' })]),
      createSection('BasedOnFavorites', 'Based On Your Favorites', [createItem({ id: 'favorites' })]),
      createSection('Trending', 'Trending', [createItem({ id: 'trending' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, true);

    expect(presented.map((section) => section.type)).toEqual(['Trending']);
  });

  it('omits missing optional personalized sections without breaking order', () => {
    const sections = [
      createSection('RecommendedForYou', 'Recommended For You', []),
      createSection('BecauseYouWatched', 'Because You Watched', []),
      createSection('Trending', 'Trending', [createItem({ id: 'trending' })]),
      createSection('NewReleases', 'New Releases', [createItem({ id: 'new' })]),
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, true);

    expect(presented.map((section) => section.type)).toEqual([
      'Trending',
      'NewReleases',
      'TopRated',
    ]);
  });

  it('supports sparse cold-start data when only Top Rated is available', () => {
    const sections = [
      createSection('Trending', 'Trending', []),
      createSection('NewReleases', 'New Releases', []),
      createSection('TopRated', 'Top Rated', [createItem({ id: 'top' })]),
    ];

    const presented = applyHomeSectionPolicy(sections, false);

    expect(presented.map((section) => section.type)).toEqual(['TopRated']);
  });
});
