import { fireEvent, render, screen } from '@testing-library/react-native';
import WorldCinemaScreen from '../../../app/(tabs)/(app-shell)/world-cinema';
import { t } from '../../i18n/i18n-test-utils';
import { useWorldCinema } from '@/features/discovery/hooks/useWorldCinema';

const mockSetParams = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ setParams: mockSetParams, push: mockPush, replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => ({
    mediaType: 'movie',
    originCountry: 'KR',
    sort: 'popularity_desc',
  }),
  usePathname: jest.fn(() => '/world-cinema'),
  useSegments: jest.fn(() => ['world-cinema']),
}));

jest.mock('@/features/discovery/hooks/useWorldCinema', () => ({
  useWorldCinema: jest.fn(),
}));

jest.mock('@/features/discovery/hooks/useGenres', () => ({
  useGenres: jest.fn(() => ({
    data: [{ id: 'genre-1', name: 'Drama' }],
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: jest.fn(() => ({
    region: 'TR',
    source: 'fallback',
    isHydrated: true,
    setRegion: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  })),
}));

jest.mock('@/features/details/shared/components/DetailScreenScaffold', () => ({
  DetailBackButton: () => null,
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');

  return {
    ...actual,
    useQueryClient: () => ({
      prefetchQuery: jest.fn(),
      invalidateQueries: jest.fn(),
    }),
  };
});

describe('WorldCinemaScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWorldCinema as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'movie-1',
                type: 'movie',
                title: 'Parasite',
                posterUrl: '/poster.jpg',
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });
  });

  it('renders world cinema header and movie results without inline controls', () => {
    render(<WorldCinemaScreen />);

    expect(screen.getByText('World Cinema')).toBeTruthy();
    expect(screen.getByText('Parasite')).toBeTruthy();
    expect(screen.getByTestId('world-cinema-actions-sort')).toBeTruthy();
    expect(screen.getByTestId('world-cinema-actions-filter')).toBeTruthy();
    expect(screen.queryByTestId('origin-country-selector')).toBeNull();
    expect(screen.queryByText('Korean Cinema')).toBeNull();
  });

  it('applies sort immediately via setParams', () => {
    render(<WorldCinemaScreen />);

    fireEvent.press(screen.getByLabelText(t('discovery.catalogFilters.sortAction')));
    fireEvent.press(
      screen.getByLabelText(t('discovery.worldCinemaScreen.sortOptions.rating_desc')),
    );

    expect(mockSetParams).toHaveBeenCalled();
    expect(mockSetParams.mock.calls.some(([params]) => params.sort === 'rating_desc')).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('opens filter sheet with country as a primary field', () => {
    render(<WorldCinemaScreen />);

    fireEvent.press(screen.getByLabelText(t('discovery.catalogFilters.filterAction')));
    expect(screen.getByText(t('common.originCountry'))).toBeTruthy();
    expect(screen.getByLabelText(`${t('discovery.catalogFilters.minVoteCount')}, ${t('discovery.catalogFilters.any')}`)).toBeTruthy();
  });
});
