import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../utils/render-with-providers';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { getCollectionDetails } from '@/features/details/collection/api/collection-api';
import type { MovieDetailsResponse } from '@/features/details/movie/types';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
  useSegments: jest.fn(() => ['(tabs)', 'movie', '[id]']),
}));

jest.mock('@/features/details/collection/api/collection-api', () => ({
  getCollectionDetails: jest.fn(),
}));

jest.mock('@/features/details/shared/components/DetailActionBar', () => ({
  DetailActionBar: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'Action Bar');
  },
}));

jest.mock('@/features/details/shared/components/DetailSections', () => ({
  DetailOverview: ({ overview }: { overview?: string | null }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, overview ?? 'Overview');
  },
}));

jest.mock('@/features/details/videos/components/PlayTrailerButton', () => ({
  PlayTrailerButton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'Trailer');
  },
}));

jest.mock('@/features/ratings/components/DetailInlineRatingSection', () => ({
  DetailInlineRatingSection: () => null,
}));
jest.mock('@/features/details/credits/components/CastRail', () => ({ CastRail: () => null }));
jest.mock('@/features/details/watch-providers/components/WhereToWatchRail', () => ({
  WhereToWatchRail: () => null,
}));
jest.mock('@/features/reviews/components/ReviewsSection', () => ({ ReviewsSection: () => null }));
jest.mock('@/features/recommendations/components/SimilarContentSection', () => ({
  SimilarContentSection: () => null,
}));

const baseMovie: MovieDetailsResponse = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  externalIds: { tmdbId: 1, tvdbId: null, imdbId: null },
  title: 'The Dark Knight',
  originalTitle: null,
  overview: 'Overview copy',
  releaseDate: '2008-07-18',
  runtimeMinutes: 152,
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 9,
  voteCount: 30000,
  genres: ['Action'],
  collection: null,
  isReleased: true,
  canFollowForRelease: false,
  canSetReleaseAlert: false,
};

describe('movie detail collection row', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders collection row between action bar and overview', () => {
    renderWithProviders(
      <MovieDetailContent
        movie={{
          ...baseMovie,
          collection: {
            tmdbId: 9485,
            name: 'The Dark Knight Collection',
            posterPath: '/collection.jpg',
            backdropPath: '/backdrop.jpg',
          },
        }}
      />,
    );

    const texts = screen
      .getAllByText(/Trailer|Action Bar|Overview copy/)
      .map((node) => node.props.children);
    expect(texts).toEqual(['Trailer', 'Action Bar', 'Overview copy']);
    expect(screen.getByTestId('collection-link-row')).toBeTruthy();
    expect(screen.getByLabelText('Part of The Dark Knight Collection')).toBeTruthy();
  });

  it('omits collection row without leaving layout gap when collection is null', () => {
    renderWithProviders(<MovieDetailContent movie={baseMovie} />);

    expect(screen.queryByTestId('collection-link-row')).toBeNull();
    const texts = screen
      .getAllByText(/Trailer|Action Bar|Overview copy/)
      .map((node) => node.props.children);
    expect(texts).toEqual(['Trailer', 'Action Bar', 'Overview copy']);
  });

  it('does not fetch collection details from movie detail', () => {
    renderWithProviders(
      <MovieDetailContent
        movie={{
          ...baseMovie,
          collection: {
            tmdbId: 9485,
            name: 'The Dark Knight Collection',
            posterPath: null,
            backdropPath: null,
          },
        }}
      />,
    );

    expect(getCollectionDetails).not.toHaveBeenCalled();
  });
});
