import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../utils/render-with-providers';
import { ApiError } from '@/api/errors';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import { SeasonDetailContent } from '@/features/details/season/components/SeasonDetailContent';
import { EpisodeDetailContent } from '@/features/details/episode/components/EpisodeDetailContent';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import type { MovieDetailsResponse } from '@/features/details/movie/types';
import type { TvShowDetailsResponse } from '@/features/details/tv/types';
import type { SeasonResponse } from '@/features/details/season/types';
import type { EpisodeResponse, EpisodeSummaryResponse } from '@/features/details/episode/types';
import { SeasonListItem } from '@/features/details/tv/components/SeasonList';
import { EpisodeList } from '@/features/details/season/components/EpisodeList';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: mockPush, navigate: jest.fn() }),
  useNavigation: () => ({ setOptions: jest.fn() }),
  useSegments: jest.fn(() => ['(tabs)', 'movie', '[id]']),
}));

jest.mock('@/features/details/shared/components/DetailActionBar', () => ({
  DetailActionBar: () => null,
}));

jest.mock('@/features/details/videos/components/PlayTrailerButton', () => ({
  PlayTrailerButton: () => null,
}));

jest.mock('@/features/ratings/components/DetailInlineRatingSection', () => ({
  DetailInlineRatingSection: () => null,
}));

jest.mock('@/features/details/credits/components/CastRail', () => ({
  CastRail: () => null,
}));

jest.mock('@/features/details/watch-providers/components/WhereToWatchRail', () => ({
  WhereToWatchRail: () => null,
}));

jest.mock('@/features/details/shared/components/DetailEpisodeActionBar', () => ({
  DetailEpisodeActionBar: () => null,
}));

jest.mock('@/features/watch-history/components/SeasonProgressInline', () => ({
  SeasonProgressInline: () => null,
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

jest.mock('@/features/watch-history/components/WatchedButton', () => ({
  WatchedButton: () => null,
}));

jest.mock('@/features/reviews/components/ReviewsLinkRow', () => ({
  ReviewsLinkRow: () => null,
}));

jest.mock('@/features/recommendations/components/SimilarContentSection', () => ({
  SimilarContentSection: () => null,
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: () => true,
  }),
}));

jest.mock('@/features/watch-history/hooks/useSeasonWatchedEpisodes', () => ({
  useSeasonWatchedEpisodes: () => ({
    data: { tvShowId: 'tv-id', seasonNumber: 2, watchedEpisodeIds: [] },
    isLoading: false,
    isError: false,
  }),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleEpisodeWatched: () => ({ mutate: jest.fn(), isPending: false }),
  useBulkUpdateEpisodeWatchState: () => ({ mutate: jest.fn(), isPending: false }),
  useMarkThroughEpisode: () => ({ mutate: jest.fn(), isPending: false }),
  useToggleSeasonWatched: () => ({ mutate: jest.fn(), isPending: false }),
}));

const movie: MovieDetailsResponse = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  externalIds: { tmdbId: 1, tvdbId: null, imdbId: null },
  title: 'Interstellar',
  originalTitle: null,
  overview: null,
  releaseDate: null,
  runtimeMinutes: null,
  posterPath: null,
  backdropPath: null,
  originalLanguage: null,
  voteAverage: 8.4,
  voteCount: 1000,
  genres: [],
  collection: null,
  isReleased: true,
  canFollowForRelease: false,
  canSetReleaseAlert: false,
};

describe('detail UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders movie detail with nullable fields', () => {
    renderWithProviders(<MovieDetailContent movie={movie} />);
    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.queryByText('Genres')).toBeNull();
    expect(screen.queryByText('Overview')).toBeNull();
    expect(screen.queryByText(/IMDb/)).toBeNull();
    expect(screen.queryByText(/TMDB /)).toBeNull();
  });

  it('renders tv detail with empty seasons state', () => {
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

    renderWithProviders(<TvShowDetailContent show={show} />);
    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByText('No seasons available.')).toBeTruthy();
    expect(screen.queryByText('Watch Progress')).toBeNull();
  });

  it('renders season detail with empty episodes state', () => {
    const season: SeasonResponse = {
      id: 'season-id',
      tvShowId: 'tv-id',
      seasonNumber: 1,
      name: 'Season 1',
      overview: null,
      airDate: null,
      episodeCount: 0,
      posterPath: null,
      episodes: [],
    };

    render(<SeasonDetailContent season={season} />);
    expect(screen.getByText('No episodes available.')).toBeTruthy();
  });

  it('renders episode detail with null still path', () => {
    const episode: EpisodeResponse = {
      id: 'episode-id',
      tvShowId: 'tv-id',
      seasonId: 'season-id',
      seasonNumber: 1,
      episodeNumber: 1,
      name: 'Pilot',
      overview: null,
      airDate: null,
      runtimeMinutes: null,
      stillPath: null,
      voteAverage: 8.2,
      voteCount: 10,
    };

    render(<EpisodeDetailContent episode={episode} />);
    expect(screen.getByText('Pilot')).toBeTruthy();
    expect(screen.getByText('Season 1 · Episode 1')).toBeTruthy();
  });

  it('renders not found state', () => {
    render(
      <DetailQueryState
        query={{
          data: undefined,
          error: new ApiError({ kind: 'not_found' }),
          isLoading: false,
          isError: true,
          refetch: jest.fn(),
        }}
        notFoundTitle="Movie not found"
        notFoundMessage="This movie could not be found."
      >
        {() => null}
      </DetailQueryState>,
    );

    expect(screen.getByText('Movie not found')).toBeTruthy();
  });

  it('renders retry on network error', () => {
    const refetch = jest.fn();

    render(
      <DetailQueryState
        query={{
          data: undefined,
          error: new ApiError({ kind: 'network' }),
          isLoading: false,
          isError: true,
          refetch,
        }}
        notFoundTitle="Movie not found"
        notFoundMessage="This movie could not be found."
      >
        {() => null}
      </DetailQueryState>,
    );

    fireEvent.press(screen.getByText('Try Again'));
    expect(refetch).toHaveBeenCalled();
  });

  it('navigates from tv detail season item to season screen', () => {
    render(
      <SeasonListItem
        tvShowId="tv-id"
        season={{
          id: 'season-id',
          seasonNumber: 2,
          name: 'Season 2',
          airDate: '2009-03-08',
          episodeCount: 13,
          posterPath: null,
        }}
        showWatchedControl={false}
      />,
    );

    fireEvent.press(screen.getByLabelText('Open Season 2'));
    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id/season/2');
  });

  it('navigates from season episode item to episode screen', () => {
    const episode: EpisodeSummaryResponse = {
      id: 'episode-id',
      episodeNumber: 3,
      name: 'Half Measures',
      airDate: '2010-06-06',
      runtimeMinutes: 47,
      stillPath: null,
      voteAverage: 8.8,
      voteCount: 50,
    };

    render(
      <EpisodeList tvShowId="tv-id" seasonNumber={2} episodes={[episode]} />,
    );

    fireEvent.press(screen.getByTestId('episode-content-3'));
    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id/season/2/episode/3');
  });
});
