import { fireEvent, render, screen } from '@testing-library/react-native';
import WorldCinemaScreen from '../../../app/world-cinema';
import { useWorldCinema } from '@/features/discovery/hooks/useWorldCinema';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => ({
    mediaType: 'movie',
    originCountry: 'KR',
    sort: 'popularity_desc',
  }),
}));

jest.mock('@/features/discovery/hooks/useWorldCinema', () => ({
  useWorldCinema: jest.fn(),
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

  it('renders world cinema header and movie results', () => {
    render(<WorldCinemaScreen />);

    expect(screen.getByText('World Cinema')).toBeTruthy();
    expect(screen.getByText('Parasite')).toBeTruthy();
    expect(screen.getByLabelText('Origin country Korean')).toBeTruthy();
  });

  it('switches media type in url state', () => {
    render(<WorldCinemaScreen />);

    fireEvent.press(screen.getByLabelText('TV Shows'));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('mediaType=tv'),
    );
  });
});
