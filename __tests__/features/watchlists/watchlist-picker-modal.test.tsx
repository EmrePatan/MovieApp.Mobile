import { render, screen, fireEvent } from '@testing-library/react-native';
import { WatchlistPickerModal } from '@/features/watchlists/components/WatchlistPickerModal';
import { useCreateWatchlist, useWatchlistItemMutation } from '@/features/watchlists/hooks/useWatchlistMutations';
import { useWatchlistMembership, useWatchlists } from '@/features/watchlists/hooks/useWatchlists';

const mockItemMutate = jest.fn();
const mockCreateMutate = jest.fn();

jest.mock('@/features/watchlists/hooks/useWatchlists', () => ({
  useWatchlists: jest.fn(),
  useWatchlistMembership: jest.fn(),
}));

jest.mock('@/features/watchlists/hooks/useWatchlistMutations', () => ({
  useCreateWatchlist: jest.fn(),
  useWatchlistItemMutation: jest.fn(),
}));

describe('WatchlistPickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWatchlists as jest.Mock).mockReturnValue({
      data: [{ id: 'wl-1', name: 'Favorites', itemCount: 2, createdAt: '', updatedAt: '' }],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    (useWatchlistMembership as jest.Mock).mockReturnValue({
      data: { 'wl-1': false },
      isLoading: false,
      refetch: jest.fn(),
    });
    (useWatchlistItemMutation as jest.Mock).mockReturnValue({
      mutate: mockItemMutate,
      isPending: false,
    });
    (useCreateWatchlist as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });
  });

  it('renders empty watchlist state', () => {
    (useWatchlists as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(
      <WatchlistPickerModal
        visible
        contentType="movie"
        contentId="movie-id"
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText('You do not have any watchlists yet.')).toBeTruthy();
  });

  it('adds item to selected watchlist', () => {
    render(
      <WatchlistPickerModal
        visible
        contentType="movie"
        contentId="movie-id"
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('Add to Favorites'));
    expect(mockItemMutate).toHaveBeenCalledWith(
      { watchlistId: 'wl-1', isInWatchlist: false },
      expect.any(Object),
    );
  });

  it('shows error state when watchlists fail to load', () => {
    (useWatchlists as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });

    render(
      <WatchlistPickerModal
        visible
        contentType="tv"
        contentId="tv-id"
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText('Could not load watchlists.')).toBeTruthy();
  });
});
