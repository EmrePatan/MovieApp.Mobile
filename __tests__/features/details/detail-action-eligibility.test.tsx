import mockReact from 'react';
import { render, screen } from '@testing-library/react-native';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import type { MovieDetailsResponse } from '@/features/details/movie/types';
import type { TvShowDetailsResponse } from '@/features/details/tv/types';

jest.mock('@/features/details/videos/components/PlayTrailerButton', () => ({
  PlayTrailerButton: () => null,
}));

jest.mock('@/features/gallery/hooks/useGallery', () => ({
  useMovieGallery: () => ({ data: undefined, isLoading: false }),
  useTvShowGallery: () => ({ data: undefined, isLoading: false }),
}));

jest.mock('@/features/follows/components/FollowButton', () => {
  const { Text } = require('react-native');

  return {
    FollowButton: () => <Text>Follow</Text>,
  };
});

jest.mock('@/features/follows/components/MovieFollowButton', () => {
  const { Text } = require('react-native');

  return {
    MovieFollowButton: () => <Text>MovieFollow</Text>,
  };
});

jest.mock('@/features/details/shared/components/DetailActionBar', () => ({
  DetailActionBar: ({
    contentType,
    showWatched,
    showReleaseAlert,
    showFollow,
  }: {
    contentType: string;
    showWatched?: boolean;
    showReleaseAlert?: boolean;
    showFollow?: boolean;
  }) =>
    mockReact.createElement(
      'Text',
      null,
      `Actions:${contentType}${showWatched ? ':watched' : ''}${showReleaseAlert ? ':alert' : ''}${showFollow ? ':follow' : ''}`,
    ),
}));

jest.mock('@/features/ratings/components/DetailInlineRatingSection', () => ({
  DetailInlineRatingSection: ({ contentType }: { contentType: string }) =>
    mockReact.createElement('Text', null, `Rating:${contentType}`),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: () => ({ data: null, isLoading: false, isError: false }),
}));

jest.mock('@/features/watch-history/hooks/useSeasonProgress', () => ({
  useSeasonProgress: () => ({ data: null, isLoading: false, isError: false }),
}));

jest.mock('@/features/details/season/hooks/useSeasonCatalog', () => ({
  useSeasonCatalog: () => ({ data: undefined, isLoading: false, isError: false }),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleSeasonWatched: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/features/reviews/components/ReviewsLinkRow', () => ({
  ReviewsLinkRow: () => null,
}));

jest.mock('@/features/recommendations/components/SimilarContentSection', () => ({
  SimilarContentSection: () => null,
}));

jest.mock('@/features/details/credits/components/CastRail', () => ({
  CastRail: () => null,
}));

jest.mock('@/features/details/watch-providers/components/WhereToWatchRail', () => ({
  WhereToWatchRail: () => null,
}));

const baseMovie: Omit<MovieDetailsResponse, 'isReleased' | 'canFollowForRelease' | 'canSetReleaseAlert'> = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  externalIds: { tmdbId: 1, tvdbId: null, imdbId: null },
  title: 'Future Movie',
  originalTitle: null,
  overview: 'Not out yet.',
  releaseDate: '2027-01-01',
  runtimeMinutes: 120,
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 0,
  voteCount: 0,
  genres: ['Action'],
  collection: null,
};

const baseShow: Omit<TvShowDetailsResponse, 'canFollow'> = {
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  externalIds: { tmdbId: 1, tvdbId: null, imdbId: null },
  title: 'Breaking Bad',
  originalTitle: null,
  overview: 'A teacher cooks.',
  firstAirDate: '2008-01-20',
  lastAirDate: '2013-09-29',
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 8.9,
  voteCount: 100,
  status: 'Ended',
  genres: ['Drama'],
  seasons: [],
};

describe('detail action eligibility', () => {
  it('15. shows movie release alert when canSetReleaseAlert is true', () => {
    render(
      <MovieDetailContent
        movie={{
          ...baseMovie,
          isReleased: false,
          canFollowForRelease: true,
          canSetReleaseAlert: true,
        }}
      />,
    );

    expect(screen.getByText('Actions:movie:alert')).toBeTruthy();
  });

  it('16. hides movie release alert when canSetReleaseAlert is false', () => {
    render(
      <MovieDetailContent
        movie={{
          ...baseMovie,
          releaseDate: '2020-01-01',
          isReleased: true,
          canFollowForRelease: false,
          canSetReleaseAlert: false,
        }}
      />,
    );

    expect(screen.getByText('Actions:movie:watched')).toBeTruthy();
    expect(screen.queryByText('Actions:movie:alert')).toBeNull();
  });

  it('17. uses server canSetReleaseAlert instead of client releaseDate', () => {
    render(
      <MovieDetailContent
        movie={{
          ...baseMovie,
          releaseDate: '2027-01-01',
          isReleased: true,
          canFollowForRelease: false,
          canSetReleaseAlert: false,
        }}
      />,
    );

    expect(screen.queryByText('Actions:movie:alert')).toBeNull();
  });

  it('18. keeps non-alert actions visible when release alert is hidden', () => {
    render(
      <MovieDetailContent
        movie={{
          ...baseMovie,
          isReleased: true,
          canFollowForRelease: false,
          canSetReleaseAlert: false,
        }}
      />,
    );

    expect(screen.getByText('Actions:movie:watched')).toBeTruthy();
    expect(screen.getByText('Rating:movie')).toBeTruthy();
  });

  it('19. shows TV follow when canFollow is true', () => {
    render(
      <TvShowDetailContent
        show={{
          ...baseShow,
          status: 'Returning Series',
          canFollow: true,
        }}
      />,
    );

    expect(screen.getByText('Actions:tv:watched:follow')).toBeTruthy();
  });

  it('20. hides TV follow when canFollow is false for ended shows', () => {
    render(
      <TvShowDetailContent
        show={{
          ...baseShow,
          status: 'Ended',
          canFollow: false,
        }}
      />,
    );

    expect(screen.getByText('Actions:tv:watched')).toBeTruthy();
    expect(screen.queryByText('Actions:tv:watched:follow')).toBeNull();
  });

  it('21. hides TV follow when canFollow is false for canceled shows', () => {
    render(
      <TvShowDetailContent
        show={{
          ...baseShow,
          status: 'Canceled',
          canFollow: false,
        }}
      />,
    );

    expect(screen.queryByText('Actions:tv:watched:follow')).toBeNull();
  });

  it('22. keeps TV watched visible when follow is hidden', () => {
    render(
      <TvShowDetailContent
        show={{
          ...baseShow,
          status: 'Ended',
          canFollow: false,
        }}
      />,
    );

    expect(screen.getByText('Actions:tv:watched')).toBeTruthy();
    expect(screen.getByText('Rating:tv')).toBeTruthy();
  });

  it('23. preserves movie consumption guardrails when alert eligibility is false', () => {
    render(
      <MovieDetailContent
        movie={{
          ...baseMovie,
          isReleased: false,
          canFollowForRelease: false,
          canSetReleaseAlert: false,
        }}
      />,
    );

    expect(screen.getByText('Actions:movie')).toBeTruthy();
    expect(screen.queryByText('Actions:movie:watched')).toBeNull();
    expect(screen.queryByText('Rating:movie')).toBeNull();
  });

  it('24. shows movie release alert when release date is unknown but eligibility is true', () => {
    render(
      <MovieDetailContent
        movie={{
          ...baseMovie,
          releaseDate: null,
          isReleased: true,
          canFollowForRelease: true,
          canSetReleaseAlert: true,
        }}
      />,
    );

    expect(screen.getByText('Actions:movie:watched:alert')).toBeTruthy();
  });
});
