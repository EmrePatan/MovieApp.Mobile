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

function mockProvider(
  providerId: number,
  name: string,
  availabilityTypes: string[],
): {
  providerId: number;
  name: string;
  logoPath: string;
  displayPriority: number;
  availabilityTypes: string[];
  link: null;
} {
  return {
    providerId,
    name,
    logoPath: `/${name}.png`,
    displayPriority: providerId,
    availabilityTypes,
    link: null,
  };
}

describe('WhereToWatchRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTvShowWatchProviders as jest.Mock).mockReturnValue({ isLoading: false, isError: false, data: { providers: [] } });
    (getCatalogDetailWatchRegion as jest.Mock).mockReturnValue(null);
    (useRegionalPreference as jest.Mock).mockReturnValue({
      region: 'TR',
      isHydrated: true,
    });
  });

  it('displays flatrate providers in a single rail without subsection headings', () => {
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        region: 'TR',
        attributionLink: null,
        providers: [mockProvider(8, 'Netflix', ['flatrate'])],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.getByText('Where to Watch')).toBeTruthy();
    expect(screen.getByTestId('watch-provider-logo-8')).toBeTruthy();
    expect(screen.queryByTestId('where-to-watch-group-flatrate')).toBeNull();
    expect(screen.queryByText('Included with Subscription')).toBeNull();
  });

  it('displays providers that include flatrate alongside other monetization types', () => {
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        region: 'TR',
        attributionLink: null,
        providers: [mockProvider(2, 'Apple TV', ['flatrate', 'rent'])],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.getByTestId('watch-provider-2')).toBeTruthy();
  });

  it.each([
    ['rent', ['rent']],
    ['buy', ['buy']],
    ['free', ['free']],
    ['ads', ['ads']],
  ])('does not display %s-only providers', (_label, availabilityTypes) => {
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        region: 'TR',
        attributionLink: null,
        providers: [mockProvider(99, 'Store', availabilityTypes)],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('watch-provider-99')).toBeNull();
    expect(screen.getByTestId('where-to-watch-empty-subscription')).toBeTruthy();
    expect(screen.getByText('Not currently available with a streaming subscription.')).toBeTruthy();
  });

  it('shows localized empty state when no flatrate providers exist', () => {
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        region: 'TR',
        attributionLink: null,
        providers: [
          mockProvider(2, 'Apple TV', ['rent', 'buy']),
          mockProvider(3, 'Google Play', ['buy']),
        ],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.getByTestId('where-to-watch-rail')).toBeTruthy();
    expect(screen.getByTestId('where-to-watch-empty-subscription')).toBeTruthy();
    expect(screen.queryByTestId('watch-provider-2')).toBeNull();
  });

  it('shows the same empty state when the API returns zero providers', () => {
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { region: 'TR', providers: [], attributionLink: null },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.getByTestId('where-to-watch-empty-subscription')).toBeTruthy();
  });

  it('uses user region when hydrated without showing region copy', () => {
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
        providers: [mockProvider(8, 'Netflix', ['flatrate'])],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(useMovieWatchProviders).toHaveBeenCalledWith(movieId, 'US', true);
    expect(screen.queryByTestId('where-to-watch-region')).toBeNull();
    expect(screen.queryByText('US')).toBeNull();
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

  it('prefers contextual watchRegion from discovery navigation without showing region copy', () => {
    (getCatalogDetailWatchRegion as jest.Mock).mockReturnValue('US');
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        region: 'US',
        providers: [mockProvider(8, 'Netflix', ['flatrate'])],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(useMovieWatchProviders).toHaveBeenCalledWith(movieId, 'US', true);
    expect(screen.queryByTestId('where-to-watch-region')).toBeNull();
  });

  it('omits the section when the query fails', () => {
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('where-to-watch-rail')).toBeNull();
  });
});
