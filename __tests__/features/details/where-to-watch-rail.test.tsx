import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WhereToWatchRail } from '@/features/details/watch-providers/components/WhereToWatchRail';
import {
  useMovieWatchProviders,
  useTvShowWatchProviders,
} from '@/features/details/watch-providers/hooks/useWatchProviders';

jest.mock('@/features/details/watch-providers/hooks/useWatchProviders', () => ({
  useMovieWatchProviders: jest.fn(),
  useTvShowWatchProviders: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('WhereToWatchRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTvShowWatchProviders as jest.Mock).mockReturnValue({ isLoading: false, isError: false, data: { providers: [] } });
  });

  it('renders circular providers in priority order with TR and attribution', () => {
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        region: 'TR',
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
          {
            providerId: 337,
            name: 'Disney+',
            logoPath: '/disney.png',
            displayPriority: 2,
            availabilityTypes: ['flatrate', 'rent'],
            link: null,
          },
        ],
      },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.getByText('Where to Watch')).toBeTruthy();
    expect(screen.getByTestId('where-to-watch-region')).toHaveTextContent('TR');
    expect(screen.getByTestId('watch-provider-8')).toBeTruthy();
    expect(screen.getByTestId('watch-provider-337')).toBeTruthy();
    expect(screen.getByText('Netflix')).toBeTruthy();
    expect(screen.getByText('Disney+')).toBeTruthy();
    expect(screen.getByTestId('where-to-watch-attribution')).toHaveTextContent(
      'Data provided by JustWatch',
    );
    expect(screen.queryByText('Stream')).toBeNull();
    expect(screen.queryByText('Rent')).toBeNull();
    expect(screen.queryByText('Buy')).toBeNull();
  });

  it('omits the section when no providers are available', () => {
    (useMovieWatchProviders as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { region: 'TR', providers: [], attributionLink: null },
    });

    render(<WhereToWatchRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('where-to-watch-rail')).toBeNull();
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
