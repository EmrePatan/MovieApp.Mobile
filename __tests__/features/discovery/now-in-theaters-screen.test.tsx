import { render, screen } from '@testing-library/react-native';
import NowInTheatersScreen from '../../../app/(tabs)/(app-shell)/now-in-theaters';
import { useNowInTheaters } from '@/features/discovery/hooks/useNowInTheaters';

jest.mock('expo-router', () => ({
  useRouter: () => ({ setParams: jest.fn(), push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/now-in-theaters'),
  useSegments: jest.fn(() => ['now-in-theaters']),
}));

jest.mock('@/features/discovery/hooks/useNowInTheaters', () => ({
  useNowInTheaters: jest.fn(),
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

describe('NowInTheatersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNowInTheaters as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [] }] },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });
  });

  it('renders without a release region selector', () => {
    render(<NowInTheatersScreen />);

    expect(screen.getAllByText('Now in Theaters').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('release-region-selector')).toBeNull();
    expect(screen.queryByText('Release region')).toBeNull();
  });

  it('queries theatrical listings using the user region by default', () => {
    render(<NowInTheatersScreen />);

    expect(useNowInTheaters).toHaveBeenCalledWith({ releaseRegion: 'TR' }, undefined, true);
  });

  it('honors explicit releaseRegion deep links', () => {
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({ releaseRegion: 'US' });

    render(<NowInTheatersScreen />);

    expect(useNowInTheaters).toHaveBeenCalledWith({ releaseRegion: 'US' }, undefined, true);
  });
});
