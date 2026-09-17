import { fireEvent, render, screen } from '@testing-library/react-native';
import { LibraryWatchlistsOverview } from '@/features/library/components/LibraryWatchlistsOverview';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

const mockRefetch = jest.fn();

jest.mock('@/features/watchlists/components/CreateWatchlistModal', () => ({
  CreateWatchlistModal: () => null,
}));

jest.mock('@/features/watchlists/hooks/useWatchlists', () => ({
  useWatchlists: jest.fn(() => ({
    data: [
      {
        id: 'wl-1',
        name: 'Weekend Movies',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        itemCount: 8,
      },
      {
        id: 'wl-2',
        name: 'Watch Later',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        itemCount: 12,
      },
    ],
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: mockRefetch,
  })),
}));

const { useWatchlists } = jest.requireMock('@/features/watchlists/hooks/useWatchlists') as {
  useWatchlists: jest.Mock;
};

describe('LibraryWatchlistsOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list overview instead of a flat content grid', () => {
    render(
      <LibraryWatchlistsOverview
        listHeader={<></>}
      />,
    );

    expect(screen.getByTestId('library-watchlists-overview')).toBeTruthy();
    expect(screen.getByLabelText('Weekend Movies, 8 titles')).toBeTruthy();
    expect(screen.getByLabelText('Watch Later, 12 titles')).toBeTruthy();
    expect(screen.queryByTestId('library-grid-three-column')).toBeNull();
  });

  it('opens a selected watchlist detail route', () => {
    render(
      <LibraryWatchlistsOverview
        listHeader={<></>}
      />,
    );

    fireEvent.press(screen.getByLabelText('Weekend Movies, 8 titles'));

    expect(mockPush).toHaveBeenCalledWith('/watchlist/wl-1');
  });

  it('shows create-list entry point', () => {
    render(
      <LibraryWatchlistsOverview
        listHeader={<></>}
      />,
    );

    expect(screen.getByText('New List')).toBeTruthy();
  });

  it('shows empty state when user has no watchlists', () => {
    useWatchlists.mockImplementationOnce(() => ({
      data: [],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: mockRefetch,
    }));

    render(
      <LibraryWatchlistsOverview
        listHeader={<></>}
      />,
    );

    expect(screen.getByText("You don't have any watchlists yet")).toBeTruthy();
  });
});
