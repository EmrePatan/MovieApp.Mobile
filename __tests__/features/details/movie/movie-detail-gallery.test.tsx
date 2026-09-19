import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import { PersonDetailContent } from '@/features/details/person/components/PersonDetailContent';
import type { MovieDetailsResponse } from '@/features/details/movie/types';
import type { TvShowDetailsResponse } from '@/features/details/tv/types';
import type { PersonDetailResponse } from '@/features/details/person/types';
import {
  getMovieGallery,
  getPersonGallery,
  getTvShowGallery,
} from '@/features/gallery/api/gallery-api';

const mockPush = jest.fn();
const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: mockPush, navigate: jest.fn() }),
  useSegments: jest.fn(() => ['(tabs)', 'movie', '[id]']),
}));

jest.mock('@/features/gallery/api/gallery-api', () => ({
  getMovieGallery: jest.fn(),
  getTvShowGallery: jest.fn(),
  getPersonGallery: jest.fn(),
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

jest.mock('@/features/reviews/components/ReviewsLinkRow', () => ({
  ReviewsLinkRow: () => null,
}));

jest.mock('@/features/recommendations/components/SimilarContentSection', () => ({
  SimilarContentSection: () => null,
}));

jest.mock('@/features/details/collection/components/CollectionLinkRow', () => ({
  CollectionLinkRow: () => null,
}));

jest.mock('@/features/details/tv/components/SeasonList', () => ({
  SeasonList: () => null,
}));

jest.mock('@/features/details/person/components/PersonFilmographyPreviewSection', () => ({
  PersonFilmographyPreviewSection: () => null,
}));

const baseMovie: MovieDetailsResponse = {
  id: movieId,
  externalIds: { tmdbId: 157336, tvdbId: null, imdbId: null },
  title: 'Interstellar',
  originalTitle: null,
  overview: 'A team travels through a wormhole.',
  releaseDate: '2014-11-07',
  runtimeMinutes: 169,
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  originalLanguage: 'en',
  voteAverage: 8.4,
  voteCount: 1000,
  genres: ['Adventure'],
  collection: null,
  isReleased: true,
  canFollowForRelease: false,
  canSetReleaseAlert: false,
};

const baseShow: TvShowDetailsResponse = {
  id: tvShowId,
  externalIds: { tmdbId: 1396, tvdbId: null, imdbId: null },
  title: 'Breaking Bad',
  originalTitle: null,
  overview: 'A teacher cooks.',
  firstAirDate: '2008-01-20',
  lastAirDate: null,
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  originalLanguage: 'en',
  voteAverage: 8.9,
  voteCount: 100,
  status: 'Ended',
  genres: ['Drama'],
  seasons: [],
  canFollow: false,
};

const basePerson: PersonDetailResponse = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  tmdbId: 1001,
  name: 'Matthew McConaughey',
  profileImagePath: '/profile.jpg',
  biography: 'Award-winning actor.',
  birthday: '1969-11-04',
  deathday: null,
  placeOfBirth: 'Texas',
  knownForDepartment: 'Acting',
  filmography: [],
};

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function createGallery(overrides?: {
  backdrops?: { filePath: string }[];
  posters?: { filePath: string }[];
  profiles?: { filePath: string }[];
}) {
  return {
    backdrops: overrides?.backdrops ?? [],
    posters: overrides?.posters ?? [],
    logos: [],
    profiles: overrides?.profiles ?? [],
  };
}

describe('detail gallery integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders movie photos when backdrops are available', async () => {
    (getMovieGallery as jest.Mock).mockResolvedValue(
      createGallery({
        backdrops: [{ filePath: '/backdrop-1.jpg' }, { filePath: '/backdrop-2.jpg' }],
      }),
    );

    renderWithQueryClient(<MovieDetailContent movie={baseMovie} />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-preview')).toBeTruthy();
    });

    expect(screen.getByText('Photos')).toBeTruthy();
    expect(screen.getByTestId('gallery-preview-item-0')).toBeTruthy();
    expect(getMovieGallery).toHaveBeenCalledWith(movieId, expect.any(AbortSignal));
  });

  it('renders movie photos when only posters are available', async () => {
    (getMovieGallery as jest.Mock).mockResolvedValue(
      createGallery({
        posters: [{ filePath: '/poster-1.jpg' }],
      }),
    );

    renderWithQueryClient(<MovieDetailContent movie={baseMovie} />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-preview')).toBeTruthy();
    });

    expect(screen.getByTestId('gallery-preview-item-0')).toBeTruthy();
  });

  it('prefers backdrops before posters in movie preview', async () => {
    (getMovieGallery as jest.Mock).mockResolvedValue(
      createGallery({
        backdrops: [{ filePath: '/backdrop-first.jpg' }],
        posters: [{ filePath: '/poster-second.jpg' }],
      }),
    );

    renderWithQueryClient(<MovieDetailContent movie={baseMovie} />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-preview-item-0')).toBeTruthy();
    });

    expect(screen.getByLabelText('Gallery preview image 1')).toBeTruthy();
    expect(screen.getByTestId('gallery-preview-item-1')).toBeTruthy();
  });

  it('omits movie photos when gallery is empty', async () => {
    (getMovieGallery as jest.Mock).mockResolvedValue(createGallery());

    renderWithQueryClient(<MovieDetailContent movie={baseMovie} />);

    await waitFor(() => {
      expect(getMovieGallery).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('gallery-preview-loading')).toBeNull();
    });

    expect(screen.queryByTestId('gallery-preview')).toBeNull();
    expect(screen.queryByText('Photos')).toBeNull();
  });

  it('opens the image viewer when a preview photo is tapped', async () => {
    (getMovieGallery as jest.Mock).mockResolvedValue(
      createGallery({
        backdrops: [{ filePath: '/backdrop-1.jpg' }],
      }),
    );

    renderWithQueryClient(<MovieDetailContent movie={baseMovie} />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-preview-item-0')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('gallery-preview-item-0'));

    expect(screen.getByTestId('gallery-image-viewer')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to movie gallery route from see all', async () => {
    (getMovieGallery as jest.Mock).mockResolvedValue(
      createGallery({
        backdrops: [{ filePath: '/backdrop-1.jpg' }],
      }),
    );

    renderWithQueryClient(<MovieDetailContent movie={baseMovie} />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-preview')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('See all Photos'));
    expect(mockPush).toHaveBeenCalledWith(`/movie/${movieId}/gallery`, { withAnchor: true });
  });

  it('renders tv photos from gallery query', async () => {
    (getTvShowGallery as jest.Mock).mockResolvedValue(
      createGallery({
        backdrops: [{ filePath: '/tv-backdrop.jpg' }],
      }),
    );

    renderWithQueryClient(<TvShowDetailContent show={baseShow} />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-preview')).toBeTruthy();
    });

    expect(getTvShowGallery).toHaveBeenCalledWith(tvShowId, expect.any(AbortSignal));
  });

  it('renders person photos from gallery query', async () => {
    (getPersonGallery as jest.Mock).mockResolvedValue(
      createGallery({
        profiles: [{ filePath: '/profile.jpg' }],
      }),
    );

    renderWithQueryClient(<PersonDetailContent person={basePerson} />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-preview')).toBeTruthy();
    });

    expect(getPersonGallery).toHaveBeenCalledWith(basePerson.tmdbId, expect.any(AbortSignal));
  });
});
