import mockReact from 'react';
import { render, screen } from '@testing-library/react-native';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import type { MovieDetailsResponse } from '@/features/details/movie/types';
import type { TvShowDetailsResponse } from '@/features/details/tv/types';

jest.mock('@/features/details/shared/components/DetailActionsSection', () => ({
  DetailActionsSection: ({ contentType }: { contentType: string }) =>
    mockReact.createElement('Text', null, `Actions:${contentType}`),
}));

jest.mock('@/features/watch-history/components/WatchProgressSection', () => ({
  WatchProgressSection: () => null,
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
  it('renders movie detail actions section', () => {
    render(<MovieDetailContent movie={movie} />);
    expect(screen.getByText('Actions:movie')).toBeTruthy();
    expect(screen.getByText('TMDB Rating')).toBeTruthy();
  });

  it('renders tv detail actions section', () => {
    render(<TvShowDetailContent show={show} />);
    expect(screen.getByText('Actions:tv')).toBeTruthy();
    expect(screen.getByText('TMDB Rating')).toBeTruthy();
  });
});
