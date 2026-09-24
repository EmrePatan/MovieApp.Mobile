import { fireEvent, render, screen } from '@testing-library/react-native';
import { LibraryWatchlistDetailContent } from '@/features/library/components/LibraryWatchlistDetailContent';
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useSegments: () => ['watchlist', 'wl-1'],
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

const mockRefetchItems = jest.fn();
const mockFetchNextPage = jest.fn();
const mockRefetchWatchlists = jest.fn();

jest.mock('@/features/watchlists/hooks/useWatchlists', () => ({
  useWatchlists: jest.fn(() => ({
    data: [
      {
        id: 'wl-1',
        name: 'Weekend Movies',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        itemCount: 1,
      },
    ],
    isRefetching: false,
    refetch: mockRefetchWatchlists,
  })),
}));

jest.mock('@/features/watchlists/hooks/useWatchlistItems', () => ({
  useWatchlistItems: jest.fn(() => ({
    data: {
      pages: [
        {
          movies: [
            {
              id: 'movie-1',
              title: 'Interstellar',
              posterPath: '/poster.jpg',
              releaseDate: '2014-11-05',
              voteAverage: 8.5,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          tvShows: [],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
    },
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    refetch: mockRefetchItems,
    fetchNextPage: mockFetchNextPage,
  })),
}));

const mockDeleteMutate = jest.fn();
const mockRemoveMutate = jest.fn();

jest.mock('@/features/watchlists/components/RenameWatchlistModal', () => {
  const mockReact = require('react');
  const { Text } = require('react-native');

  return {
    RenameWatchlistModal: ({
      visible,
      initialName,
    }: {
      visible: boolean;
      initialName: string;
    }) =>
      visible
        ? mockReact.createElement(Text, { testID: 'rename-watchlist-modal' }, initialName)
        : null,
  };
});

const mockRenameMutate = jest.fn();

jest.mock('@/features/watchlists/hooks/useWatchlistMutations', () => ({
  useDeleteWatchlistMutation: jest.fn(() => ({
    mutate: mockDeleteMutate,
    isPending: false,
  })),
  useRenameWatchlistMutation: jest.fn(() => ({
    mutate: mockRenameMutate,
    isPending: false,
  })),
  useRemoveWatchlistItemMutation: jest.fn(() => ({
    mutate: mockRemoveMutate,
    isPending: false,
  })),
}));

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!style) {
    return {};
  }

  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acc, item) => ({ ...acc, ...flattenStyle(item) }),
      {},
    );
  }

  return style as Record<string, unknown>;
}

describe('LibraryWatchlistDetailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the selected watchlist contents', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.getByTestId('library-watchlist-detail')).toBeTruthy();
    expect(screen.getByText('Weekend Movies')).toBeTruthy();
    expect(screen.getByLabelText('Interstellar, Watchlist')).toBeTruthy();
  });

  it('lets the multi-column grid measure rows instead of supplying fixed item layouts', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    // FlatList passes row indexes to getItemLayout and the list header height is dynamic.
    expect(screen.getByTestId('library-watchlist-detail').props.getItemLayout).toBeUndefined();
  });

  it('does not show Delete List as a permanent primary action', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.queryByText('Delete List')).toBeNull();
  });

  it('exposes rename and delete actions through the overflow menu', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    fireEvent.press(screen.getByLabelText('Watchlist options'));

    expect(screen.getByTestId('watchlist-list-options-sheet')).toBeTruthy();
    expect(screen.getByText('List options')).toBeTruthy();
    expect(screen.getByTestId('watchlist-rename-option')).toBeTruthy();
    expect(screen.getByTestId('watchlist-delete-option')).toBeTruthy();
  });

  it('opens rename list modal from the overflow menu', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    fireEvent.press(screen.getByLabelText('Watchlist options'));
    fireEvent.press(screen.getByTestId('watchlist-rename-option'));

    expect(screen.getByTestId('rename-watchlist-modal')).toHaveTextContent('Weekend Movies');
  });

  it('still confirms and deletes the list from the overflow action', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    fireEvent.press(screen.getByLabelText('Watchlist options'));
    fireEvent.press(screen.getByTestId('watchlist-delete-option'));

    expect(screen.getByText('Delete list')).toBeTruthy();
    expect(screen.getByText('Delete "Weekend Movies"? This cannot be undone.')).toBeTruthy();

    fireEvent.press(screen.getByTestId('watchlist-delete-confirm-button'));

    expect(mockDeleteMutate).toHaveBeenCalledWith('wl-1', expect.any(Object));
  });

  it('shows All, Movies, and TV Shows filters without People', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.getByLabelText('Filter All')).toBeTruthy();
    expect(screen.getByLabelText('Filter Movies')).toBeTruthy();
    expect(screen.getByLabelText('Filter TV Shows')).toBeTruthy();
    expect(screen.queryByLabelText('Filter People')).toBeNull();
  });

  it('shows filters and labeled sort chips in a controls panel', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.getByLabelText('Filter All')).toBeTruthy();
    expect(screen.queryByText('Sort')).toBeNull();
    expect(screen.getByLabelText('Sort by Recently Added')).toBeTruthy();
    expect(screen.getByLabelText('Sort by Title A–Z')).toBeTruthy();
    expect(screen.getByLabelText('Sort by Rating')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Sort by Title A–Z'));
    expect(screen.getByLabelText('Sort by Title A–Z')).toBeTruthy();
  });

  it('does not show a permanent remove control in the normal row state', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.queryByLabelText('Remove Interstellar from this list')).toBeNull();
  });

  it('keeps item removal reachable through long press', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    fireEvent(
      screen.getByLabelText('Interstellar, Watchlist'),
      'longPress',
    );

    expect(mockRemoveMutate).toHaveBeenCalledWith(
      { contentType: 'movie', contentId: 'movie-1' },
      expect.any(Object),
    );
  });

  it('keeps item removal reachable through accessibility action', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    fireEvent(
      screen.getByRole('button', { name: 'Interstellar, Watchlist' }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'remove' } },
    );

    expect(mockRemoveMutate).toHaveBeenCalledWith(
      { contentType: 'movie', contentId: 'movie-1' },
      expect.any(Object),
    );
  });

  it('keeps back navigation affordance intact', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.getByLabelText('Back')).toBeTruthy();
  });

  it('renders title inline with back and overflow in a single toolbar row', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.getByText('Weekend Movies')).toBeTruthy();
    expect(screen.getByLabelText('Back')).toBeTruthy();
    expect(screen.getByLabelText('Watchlist options')).toBeTruthy();
    expect(screen.queryByText(/title/)).toBeNull();
  });

  it('does not double-pad the watchlist detail header inside the grid list', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    const header = screen.getByTestId('library-watchlist-detail-header');

    expect(flattenStyle(header.props.style).paddingHorizontal).toBeUndefined();
  });

  it('navigates to detail when a watchlist item is pressed', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    fireEvent.press(screen.getByLabelText('Interstellar, Watchlist'));

    expect(mockPush).toHaveBeenCalledWith('/movie/movie-1');
  });
});
