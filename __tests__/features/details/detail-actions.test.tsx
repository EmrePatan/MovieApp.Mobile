import mockReact from 'react';
import { render, screen } from '@testing-library/react-native';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import type { MovieDetailsResponse } from '@/features/details/movie/types';
import type { TvShowDetailsResponse } from '@/features/details/tv/types';

jest.mock('@/features/details/shared/components/DetailActionBar', () => ({
  DetailActionBar: ({ contentType, showWatched }: { contentType: string; showWatched?: boolean }) =>
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

jest.mock('@/features/reviews/components/ReviewsSection', () => ({
  ReviewsSection: () => null,
}));

jest.mock('@/features/recommendations/components/SimilarContentSection', () => ({
  SimilarContentSection: () => null,
}));

const movie: MovieDetailsResponse = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  externalIds: { tmdbId: 1, tvdbId: null, imdbId: null },
  title: 'Interstellar',
  originalTitle: null,
  overview: 'A journey through space.',
  releaseDate: '2014-11-07',
  runtimeMinutes: 169,
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 8.4,
  voteCount: 1000,
  genres: ['Sci-Fi'],
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
};

describe('detail actions integration', () => {
  it('renders movie detail action set with watched and inline rating', () => {
    render(<MovieDetailContent movie={movie} />);
    expect(screen.getByText('Actions:movie:watched')).toBeTruthy();
    expect(screen.getByText('Rating:movie')).toBeTruthy();
    expect(screen.getByText('Movie · 2014 · ★ 8.4 · 2h 49m')).toBeTruthy();
    expect(screen.queryByText('TMDB Rating')).toBeNull();
    expect(screen.queryByText(/TMDB /)).toBeNull();
    expect(screen.queryAllByText(/^Rating:/)).toHaveLength(1);
  });

  it('renders tv detail action set without watched and inline rating', () => {
    render(<TvShowDetailContent show={show} />);
    expect(screen.getByText('Actions:tv')).toBeTruthy();
    expect(screen.getByText('Rating:tv')).toBeTruthy();
    expect(screen.getByText('TV · 2008 · ★ 8.9')).toBeTruthy();
    expect(screen.queryByText('TMDB Rating')).toBeNull();
    expect(screen.queryAllByText(/^Rating:/)).toHaveLength(1);
  });
});
