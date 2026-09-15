import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('expo-linking', () => ({
  canOpenURL: jest.fn().mockResolvedValue(true),
  openURL: jest.fn().mockResolvedValue(true),
}));
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import type { MovieDetailsResponse } from '@/features/details/movie/types';
import type { TvShowDetailsResponse } from '@/features/details/tv/types';
import { useMovieVideos, useTvShowVideos } from '@/features/details/videos/hooks/useVideos';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
  useSegments: jest.fn(() => ['(tabs)', 'movie', '[id]']),
}));

jest.mock('@/features/details/videos/hooks/useVideos', () => ({
  useMovieVideos: jest.fn(),
  useTvShowVideos: jest.fn(),
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
jest.mock('@/features/details/tv/components/SeasonList', () => ({ SeasonList: () => null }));

const mockUseMovieVideos = useMovieVideos as jest.Mock;
const mockUseTvShowVideos = useTvShowVideos as jest.Mock;

const movie: MovieDetailsResponse = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  externalIds: { tmdbId: 1, tvdbId: null, imdbId: null },
  title: 'Movie Title',
  originalTitle: null,
  overview: 'Overview copy',
  releaseDate: '2020-01-01',
  runtimeMinutes: 120,
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 8,
  voteCount: 10,
  genres: ['Drama'],
};

const show: TvShowDetailsResponse = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  externalIds: { tmdbId: 2, tvdbId: null, imdbId: null },
  title: 'TV Title',
  originalTitle: null,
  overview: 'Overview copy',
  firstAirDate: '2020-01-01',
  lastAirDate: null,
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 8,
  voteCount: 10,
  status: 'Returning Series',
  genres: ['Drama'],
  seasons: [],
};

describe('detail trailer placement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMovieVideos.mockReturnValue({
      data: { primary: { watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } },
      isLoading: false,
      isError: false,
    });
    mockUseTvShowVideos.mockReturnValue({
      data: { primary: { watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } },
      isLoading: false,
      isError: false,
    });
  });

  it('integrates compact Trailer CTA in hero before action bar on movie detail', () => {
    render(<MovieDetailContent movie={movie} />);

    const texts = screen.getAllByText(/Action Bar|Trailer|Overview copy/).map((node) => node.props.children);
    expect(texts).toEqual(['Trailer', 'Action Bar', 'Overview copy']);
    expect(screen.getByLabelText('Play Trailer')).toBeTruthy();
  });

  it('integrates compact Trailer CTA in hero before action bar on tv detail', () => {
    render(<TvShowDetailContent show={show} />);

    const texts = screen.getAllByText(/Action Bar|Trailer|Overview copy/).map((node) => node.props.children);
    expect(texts).toEqual(['Trailer', 'Action Bar', 'Overview copy']);
    expect(screen.getByLabelText('Play Trailer')).toBeTruthy();
  });

  it('omits trailer CTA without leaving layout gap when primary is unavailable', () => {
    mockUseMovieVideos.mockReturnValue({
      data: { primary: null },
      isLoading: false,
      isError: false,
    });

    render(<MovieDetailContent movie={movie} />);

    expect(screen.queryByText('Trailer')).toBeNull();
    const texts = screen.getAllByText(/Action Bar|Overview copy/).map((node) => node.props.children);
    expect(texts).toEqual(['Action Bar', 'Overview copy']);
  });
});
