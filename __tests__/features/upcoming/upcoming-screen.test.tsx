import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import UpcomingScreen from '../../../app/upcoming';
import { useAuth } from '@/auth/useAuth';
import { useUpcomingCatalog } from '@/features/upcoming/hooks/useUpcomingCatalog';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';

const mockPush = jest.fn();
const mockSetParams = jest.fn();
let mockTabParam: string | undefined;

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/upcoming/hooks/useUpcomingCatalog', () => ({
  useUpcomingCatalog: jest.fn(),
}));

jest.mock('@/features/details/shared/navigation/catalog-detail-navigation', () => ({
  openCatalogDetailFromLibraryStack: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, setParams: mockSetParams }),
  useLocalSearchParams: jest.fn(() => ({ tab: mockTabParam })),
  useSegments: jest.fn(() => ['upcoming']),
}));

const movieItem = {
  id: 'movie-id',
  type: 'movie' as const,
  upcomingKind: 'MovieRelease' as const,
  title: 'Avatar 4',
  originalTitle: 'Avatar 4',
  overview: '',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2026-12-19',
  voteAverage: 8,
  voteCount: 10,
  year: 2026,
  isFollowed: true,
};

const tvEpisodeItem = {
  id: 'tv-id',
  type: 'tv' as const,
  upcomingKind: 'TvEpisode' as const,
  title: 'Severance',
  originalTitle: 'Severance',
  overview: '',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2026-09-20',
  voteAverage: 0,
  voteCount: 0,
  year: 2026,
  isFollowed: true,
  episodeId: 'episode-id',
  seasonNumber: 1,
  episodeNumber: 2,
  episodeName: 'Good News About Hell',
};

function createQueryResult(items: unknown[] = []) {
  return {
    data: { pages: [{ items }] },
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetching: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  };
}

describe('UpcomingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTabParam = undefined;
    mockSetParams.mockImplementation(({ tab }: { tab: string }) => {
      mockTabParam = tab;
    });
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useUpcomingCatalog as jest.Mock).mockImplementation((scope: string) => {
      if (scope === 'followed') {
        return createQueryResult([]);
      }

      return createQueryResult([movieItem]);
    });
  });

  it('renders For You and Upcoming tabs with Coming Up title', () => {
    render(<UpcomingScreen />);

    expect(screen.getByText('Coming Up')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'For You' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Upcoming' })).toBeTruthy();
  });

  it('defaults to For You and requests scope=followed', () => {
    render(<UpcomingScreen />);

    expect(useUpcomingCatalog).toHaveBeenCalledWith('followed', undefined, {
      enabled: true,
    });
    expect(useUpcomingCatalog).toHaveBeenCalledWith('catalog', undefined, {
      enabled: false,
    });
  });

  it('does not render People filter controls', () => {
    (useUpcomingCatalog as jest.Mock).mockImplementation((scope: string) => {
      if (scope === 'followed') {
        return createQueryResult([movieItem]);
      }

      return createQueryResult([]);
    });

    render(<UpcomingScreen />);

    expect(screen.queryByLabelText('Filter People')).toBeNull();
    expect(screen.getByLabelText('Filter Movies')).toBeTruthy();
  });

  it('renders For You empty state with Explore Upcoming action', () => {
    render(<UpcomingScreen />);

    expect(screen.getByText('Nothing coming up yet')).toBeTruthy();
    expect(
      screen.getByText(
        'Follow a show or set an alert for an upcoming movie and it will appear here.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Explore Upcoming')).toBeTruthy();
  });

  it('switches to Upcoming tab and requests scope=catalog', () => {
    const view = render(<UpcomingScreen />);

    fireEvent.press(screen.getByRole('tab', { name: 'Upcoming' }));
    view.rerender(<UpcomingScreen />);

    expect(mockSetParams).toHaveBeenCalledWith({ tab: 'upcoming' });
    expect(useUpcomingCatalog).toHaveBeenCalledWith('catalog', undefined, {
      enabled: true,
    });
  });

  it('Explore Upcoming switches tabs without navigating away', () => {
    render(<UpcomingScreen />);

    fireEvent.press(screen.getByText('Explore Upcoming'));

    expect(mockSetParams).toHaveBeenCalledWith({ tab: 'upcoming' });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders TV episode and movie items with discrimination', () => {
    (useUpcomingCatalog as jest.Mock).mockImplementation((scope: string) => {
      if (scope === 'followed') {
        return createQueryResult([tvEpisodeItem, movieItem]);
      }

      return createQueryResult([]);
    });

    render(<UpcomingScreen />);

    expect(screen.getByText('Severance')).toBeTruthy();
    expect(screen.getByText('S01 E02 · Good News About Hell')).toBeTruthy();
    expect(screen.getByText('Avatar 4')).toBeTruthy();
  });

  it('opens movie detail from For You with tab-preserving return href', () => {
    (useUpcomingCatalog as jest.Mock).mockImplementation((scope: string) => {
      if (scope === 'followed') {
        return createQueryResult([movieItem]);
      }

      return createQueryResult([]);
    });

    render(<UpcomingScreen />);
    fireEvent.press(screen.getByRole('button', { name: /Avatar 4/ }));

    expect(openCatalogDetailFromLibraryStack).toHaveBeenCalledWith(
      expect.anything(),
      'movie-id',
      'movie',
      'upcoming',
      { libraryReturnHref: '/upcoming?tab=for-you' },
    );
  });

  it('opens TV detail from Upcoming with tab-preserving return href', () => {
    mockTabParam = 'upcoming';
    (useUpcomingCatalog as jest.Mock).mockImplementation((scope: string) => {
      if (scope === 'followed') {
        return createQueryResult([]);
      }

      return createQueryResult([tvEpisodeItem]);
    });

    render(<UpcomingScreen />);
    fireEvent.press(screen.getByRole('button', { name: /Severance/ }));

    expect(openCatalogDetailFromLibraryStack).toHaveBeenCalledWith(
      expect.anything(),
      'tv-id',
      'tv',
      'upcoming',
      { libraryReturnHref: '/upcoming?tab=upcoming' },
    );
  });
});
