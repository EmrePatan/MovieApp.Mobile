import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../utils/render-with-providers';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { getCollectionDetails } from '@/features/details/collection/api/collection-api';
import type { MovieDetailsResponse } from '@/features/details/movie/types';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
  useSegments: jest.fn(() => ['(tabs)', 'movie', '[id]']),
  useFocusEffect: jest.fn((callback: () => void | (() => void)) => {
    callback();
    return undefined;
  }),
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
  DetailKeywords: () => null,
}));

jest.mock('@/features/details/shared/components/DetailUltraThinRatingRail', () => ({
  DetailUltraThinRatingRail: () => null,
}));
jest.mock('@/features/details/credits/components/CastRail', () => ({ CastRail: () => null }));
jest.mock('@/features/details/watch-providers/components/WhereToWatchRail', () => ({
  WhereToWatchRail: () => null,
}));
jest.mock('@/features/reviews/components/ReviewsLinkRow', () => ({ ReviewsLinkRow: () => null }));
jest.mock('@/features/recommendations/components/SimilarContentSection', () => ({
  SimilarContentSection: () => null,
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 'user-id' } }),
}));

jest.mock('@/features/details/videos/hooks/useVideos', () => ({
  useMovieVideos: jest.fn(),
  useTvShowVideos: jest.fn(),
}));

import { useMovieVideos, useTvShowVideos } from '@/features/details/videos/hooks/useVideos';

const mockUseMovieVideos = useMovieVideos as jest.Mock;
const mockUseTvShowVideos = useTvShowVideos as jest.Mock;

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
    (getCollectionDetails as jest.Mock).mockResolvedValue({
      tmdbId: 9485,
      name: 'The Dark Knight Collection',
      overview: null,
      posterPath: null,
      backdropPath: null,
      parts: [],
    });
    mockUseMovieVideos.mockReturnValue({
      data: { primary: { watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } },
      isLoading: false,
      isError: false,
    });
    mockUseTvShowVideos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
  });

  it('renders collection parts section after overview when movie has a collection', async () => {
    (getCollectionDetails as jest.Mock).mockResolvedValue({
      tmdbId: 9485,
      name: 'The Dark Knight Collection',
      overview: null,
      posterPath: '/collection.jpg',
      backdropPath: '/backdrop.jpg',
      parts: [
        {
          id: 'movie-batman-begins',
          title: 'Batman Begins',
          releaseDate: '2005-06-15',
          posterPath: '/begins.jpg',
          voteAverage: 8,
          voteCount: 1000,
        },
      ],
    });

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
      .getAllByText(/Action Bar|Overview copy/)
      .map((node) => node.props.children);
    expect(texts).toEqual(['Action Bar', 'Overview copy']);
    expect(screen.getByTestId('detail-trailer-play-affordance')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId('collection-parts-section')).toBeTruthy();
    });
    expect(screen.getByText('All Films in the Series')).toBeTruthy();
  });

  it('omits collection section when collection is null', () => {
    renderWithProviders(<MovieDetailContent movie={baseMovie} />);

    expect(screen.queryByTestId('collection-parts-section')).toBeNull();
    expect(getCollectionDetails).not.toHaveBeenCalled();
    const texts = screen
      .getAllByText(/Action Bar|Overview copy/)
      .map((node) => node.props.children);
    expect(texts).toEqual(['Action Bar', 'Overview copy']);
    expect(screen.getByTestId('detail-trailer-play-affordance')).toBeTruthy();
  });

  it('fetches collection details when movie has a collection summary', async () => {
    (getCollectionDetails as jest.Mock).mockResolvedValue({
      tmdbId: 9485,
      name: 'The Dark Knight Collection',
      overview: null,
      posterPath: null,
      backdropPath: null,
      parts: [],
    });

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

    await waitFor(() => {
      expect(getCollectionDetails).toHaveBeenCalledWith(9485, expect.anything());
    });
  });
});
