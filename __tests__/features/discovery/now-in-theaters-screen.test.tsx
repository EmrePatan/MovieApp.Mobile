import { fireEvent, render, screen } from '@testing-library/react-native';
import NowInTheatersScreen from '../../../app/now-in-theaters';
import { useNowInTheaters } from '@/features/discovery/hooks/useNowInTheaters';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('@/features/discovery/hooks/useNowInTheaters', () => ({
  useNowInTheaters: jest.fn(),
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
      data: {
        pages: [
          {
            items: [
              {
                id: 'movie-1',
                type: 'movie',
                title: 'Cinema One',
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

  it('renders now in theaters header and release region selector', () => {
    render(<NowInTheatersScreen />);

    expect(screen.getByText('Now in Theaters')).toBeTruthy();
    expect(screen.getByTestId('release-region-selector')).toBeTruthy();
    expect(screen.getByText('Cinema One')).toBeTruthy();
  });

  it('updates release region via replace navigation', () => {
    render(<NowInTheatersScreen />);

    fireEvent.press(screen.getByTestId('release-region-selector'));
    fireEvent.press(screen.getByLabelText('United States'));

    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('releaseRegion=US'));
  });
});
