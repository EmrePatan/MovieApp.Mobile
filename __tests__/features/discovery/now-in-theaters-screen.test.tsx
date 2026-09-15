import { fireEvent, render, screen } from '@testing-library/react-native';
import NowInTheatersScreen from '../../../app/now-in-theaters';
import { useNowInTheaters } from '@/features/discovery/hooks/useNowInTheaters';

const mockSetParams = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ setParams: mockSetParams, push: mockPush, replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: jest.fn(() => ({ releaseRegion: 'TR' })),
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

  it('updates releaseRegion via setParams without pushing navigation', () => {
    render(<NowInTheatersScreen />);

    fireEvent.press(screen.getByLabelText('Release region Turkey'));
    fireEvent.press(screen.getByLabelText('United States'));

    expect(mockSetParams).toHaveBeenCalledWith({ releaseRegion: 'US' });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
