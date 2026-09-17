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

jest.mock('@/features/details/shared/components/DetailActionBar', () => ({
  DetailActionBar: ({
    contentType,
    showWatched,
  }: {
    contentType: string;
    showWatched?: boolean;
  }) =>
    mockReact.createElement(
      'Text',
      null,
      `Actions:${contentType}${showWatched ? ':watched' : ''}`,
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

const baseMovie: Omit<MovieDetailsResponse, 'isReleased'> = {
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
  canFollowForRelease: true,
  canSetReleaseAlert: true,
};

const show: TvShowDetailsResponse = {
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  externalIds: { tmdbId: 1, tvdbId: null, imdbId: null },
  title: 'Breaking Bad',
  originalTitle: null,
  overview: 'A teacher cooks.',
  firstAirDate: '2008-01-20',
  lastAirDate: null,
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 8.9,
  voteCount: 100,
  status: 'Ended',
  genres: ['Drama'],
  seasons: [],
  canFollow: false,
};

describe('movie release guardrail', () => {
  it('1. hides watched for future effective release (isReleased false)', () => {
    render(<MovieDetailContent movie={{ ...baseMovie, isReleased: false }} />);

    expect(screen.getByText('Actions:movie')).toBeTruthy();
    expect(screen.queryByText('Actions:movie:watched')).toBeNull();
  });

  it('2. hides rating for future effective release (isReleased false)', () => {
    render(<MovieDetailContent movie={{ ...baseMovie, isReleased: false }} />);

    expect(screen.queryByText('Rating:movie')).toBeNull();
  });

  it('3. shows watched for released movies (isReleased true)', () => {
    render(<MovieDetailContent movie={{ ...baseMovie, isReleased: true }} />);

    expect(screen.getByText('Actions:movie:watched')).toBeTruthy();
  });

  it('4. shows rating for released movies (isReleased true)', () => {
    render(<MovieDetailContent movie={{ ...baseMovie, isReleased: true }} />);

    expect(screen.getByText('Rating:movie')).toBeTruthy();
  });

  it('5. keeps tv detail watched and rating unchanged', () => {
    render(<TvShowDetailContent show={show} />);

    expect(screen.getByText('Actions:tv:watched')).toBeTruthy();
    expect(screen.getByText('Rating:tv')).toBeTruthy();
  });

  it('6. keeps non-consumption action bar visible for unreleased movies', () => {
    render(<MovieDetailContent movie={{ ...baseMovie, isReleased: false }} />);

    expect(screen.getByText('Actions:movie')).toBeTruthy();
  });

  it('7. shows consumption actions when release date is unknown but isReleased is true', () => {
    render(
      <MovieDetailContent
        movie={{ ...baseMovie, releaseDate: null, isReleased: true }}
      />,
    );

    expect(screen.getByText('Actions:movie:watched')).toBeTruthy();
    expect(screen.getByText('Rating:movie')).toBeTruthy();
  });

  it('8. shows consumption actions for movies releasing today (isReleased true)', () => {
    render(
      <MovieDetailContent
        movie={{ ...baseMovie, releaseDate: '2026-09-15', isReleased: true }}
      />,
    );

    expect(screen.getByText('Actions:movie:watched')).toBeTruthy();
    expect(screen.getByText('Rating:movie')).toBeTruthy();
  });
});
