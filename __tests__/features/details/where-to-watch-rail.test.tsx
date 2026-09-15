import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WhereToWatchRail } from '@/features/details/watch-providers/components/WhereToWatchRail';
import { getCatalogDetailWatchRegion } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import {
  useMovieWatchProviders,
  useTvShowWatchProviders,
} from '@/features/details/watch-providers/hooks/useWatchProviders';

jest.mock('@/features/details/watch-providers/hooks/useWatchProviders', () => ({
  useMovieWatchProviders: jest.fn(),
  useTvShowWatchProviders: jest.fn(),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: jest.fn(),
}));

jest.mock('@/features/details/shared/navigation/catalog-detail-navigation', () => ({
  getCatalogDetailWatchRegion: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('WhereToWatchRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTvShowWatchProviders as jest.Mock).mockReturnValue({ isLoading: false, isError: false, data: { providers: [] } });
    (getCatalogDetailWatchRegion as jest.Mock).mockReturnValue(null);
  });

  it('uses user region when hydrated', () => {
    (useRegionalPreference as jest.Mock).mockReturnValue({
      region: 'US',
      isHydrated: true,
    });
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        region: 'US',
        attributionLink: 'https://www.themoviedb.org/movie/1/watch',
        providers: [
          {
            providerId: 8,
            name: 'Netflix',
            logoPath: '/netflix.png',
            displayPriority: 1,
            availabilityTypes: ['flatrate'],
            link: null,
          },
        ],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(useMovieWatchProviders).toHaveBeenCalledWith(movieId, 'US', true);
    expect(screen.getByTestId('where-to-watch-region')).toHaveTextContent('US');
  });

  it('waits for hydration before fetching with user region', () => {
    (useRegionalPreference as jest.Mock).mockReturnValue({
      region: 'TR',
      isHydrated: false,
    });
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(useMovieWatchProviders).toHaveBeenCalledWith(movieId, 'TR', false);
    expect(screen.getByTestId('where-to-watch-loading')).toBeTruthy();
  });

  it('prefers contextual watchRegion from discovery navigation', () => {
    (useRegionalPreference as jest.Mock).mockReturnValue({
      region: 'TR',
      isHydrated: true,
    });
    (getCatalogDetailWatchRegion as jest.Mock).mockReturnValue('US');
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        region: 'US',
        providers: [
          {
            providerId: 8,
            name: 'Netflix',
            logoPath: '/netflix.png',
            displayPriority: 1,
            availabilityTypes: ['flatrate'],
            link: null,
          },
        ],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(useMovieWatchProviders).toHaveBeenCalledWith(movieId, 'US', true);
    expect(screen.getByTestId('where-to-watch-region')).toHaveTextContent('US');
  });

  it('omits the section when no providers are available', () => {
    (useRegionalPreference as jest.Mock).mockReturnValue({
      region: 'TR',
      isHydrated: true,
    });
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { region: 'TR', providers: [], attributionLink: null },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('where-to-watch-rail')).toBeNull();
  });

  it('omits the section when the query fails', () => {
    (useRegionalPreference as jest.Mock).mockReturnValue({
      region: 'TR',
      isHydrated: true,
    });
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('where-to-watch-rail')).toBeNull();
  });
});
