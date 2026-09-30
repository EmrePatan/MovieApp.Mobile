import {
  buildHomeListSections,
  HOME_RECOMMENDED_LOADING_SECTION_TYPE,
} from '@/features/home/utils/build-home-list-sections';
import { shouldShowPersonalizedLoadingSlot } from '@/features/home/utils/home-personalized-loading';
import type { HomeSection } from '@/features/home/types';

const trendingSection: HomeSection = {
  type: 'Trending',
  title: 'Trending Now',
  displayOrder: 1,
  items: [
    {
      id: 'trending-1',
      contentType: 'movie',
      title: 'Trending Movie',
      originalTitle: null,
      posterUrl: null,
      backdropUrl: null,
      releaseDate: null,
      voteAverage: 8,
      voteCount: 10,
    },
  ],
};

const recommendedSection: HomeSection = {
  type: 'RecommendedForYou',
  title: 'Recommended For You',
  displayOrder: 0,
  items: [
    {
      id: 'recommended-1',
      contentType: 'movie',
      title: 'Recommended Movie',
      originalTitle: null,
      posterUrl: null,
      backdropUrl: null,
      releaseDate: null,
      voteAverage: 9,
      voteCount: 20,
    },
  ],
};

describe('Home personalized rail UX helpers', () => {
  it('reserves the Recommended For You slot above other rails while loading', () => {
    const sections = buildHomeListSections([trendingSection], true);

    expect(sections.map((section) => section.type)).toEqual([
      HOME_RECOMMENDED_LOADING_SECTION_TYPE,
      'Trending',
    ]);
  });

  it('replaces the loading slot with the real Recommended For You section at the same index', () => {
    const loading = buildHomeListSections([trendingSection], true);
    const resolved = buildHomeListSections([recommendedSection, trendingSection], false);

    expect(loading[0]?.type).toBe(HOME_RECOMMENDED_LOADING_SECTION_TYPE);
    expect(resolved[0]?.type).toBe('RecommendedForYou');
    expect(loading[1]?.type).toBe(resolved[1]?.type);
  });

  it('shows skeleton while personalization is unknown and no personalized data exists yet', () => {
    expect(
      shouldShowPersonalizedLoadingSlot('unknown', { isError: false, data: undefined }),
    ).toBe(true);
  });

  it('shows skeleton on first render before persistent cache hydration completes', () => {
    expect(
      shouldShowPersonalizedLoadingSlot('unknown', { isError: false, data: undefined }),
    ).toBe(true);
  });

  it('replaces skeleton with cached personalized data at the same logical position', () => {
    const withSkeleton = buildHomeListSections([trendingSection], true);
    const withCachedRail = buildHomeListSections([recommendedSection, trendingSection], false);

    expect(withSkeleton[0]?.type).toBe(HOME_RECOMMENDED_LOADING_SECTION_TYPE);
    expect(withCachedRail[0]?.type).toBe('RecommendedForYou');
    expect(withSkeleton[1]?.type).toBe(withCachedRail[1]?.type);
  });

  it('keeps real personalized content visible during background refetch', () => {
    expect(
      shouldShowPersonalizedLoadingSlot(
        'personalized',
        { isError: false, data: { sections: [], isPersonalized: true, generatedAtUtc: '' } },
      ),
    ).toBe(false);
  });

  it('does not show skeleton when cached personalized data is already available', () => {
    expect(
      shouldShowPersonalizedLoadingSlot(
        'unknown',
        {
          isError: false,
          data: { sections: [recommendedSection], isPersonalized: true, generatedAtUtc: '' },
        },
      ),
    ).toBe(false);
  });

  it('exits loading gracefully after personalized failure without cache', () => {
    expect(
      shouldShowPersonalizedLoadingSlot(
        'not-personalized',
        { isError: true, data: undefined },
      ),
    ).toBe(false);
  });

  it('preserves cold-start behavior when backend reports not personalized', () => {
    expect(
      shouldShowPersonalizedLoadingSlot(
        'not-personalized',
        { isError: false, data: { sections: [], isPersonalized: false, generatedAtUtc: '' } },
      ),
    ).toBe(false);
  });
});
