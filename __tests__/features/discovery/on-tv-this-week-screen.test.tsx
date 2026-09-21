import { render, screen } from '@testing-library/react-native';
import OnTvThisWeekScreen from '../../../app/on-tv-this-week';
import { useOnTvThisWeek } from '@/features/discovery/hooks/useOnTvThisWeek';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn() }),
  usePathname: jest.fn(() => '/on-tv-this-week'),
  useSegments: jest.fn(() => ['on-tv-this-week']),
}));

jest.mock('@/features/discovery/hooks/useOnTvThisWeek', () => ({
  useOnTvThisWeek: jest.fn(),
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

describe('OnTvThisWeekScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOnTvThisWeek as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'tv-1',
                type: 'tv',
                title: 'Airing Drama',
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

  it('renders on tv this week header and tv results', () => {
    render(<OnTvThisWeekScreen />);

    expect(screen.getByText('On TV This Week')).toBeTruthy();
    expect(screen.getByText('Airing Drama')).toBeTruthy();
  });
});
