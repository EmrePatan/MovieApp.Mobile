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

    expect(screen.getByText("You don't have any watchlists yet")).toBeTruthy();
    expect(screen.getByText('Create a list to save movies and TV shows you want to watch.')).toBeTruthy();
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

  it('collapses long watchlist lists until expanded', () => {
    (useWatchlists as jest.Mock).mockReturnValue({
      data: [
        { id: 'wl-1', name: 'Action', itemCount: 1, createdAt: '', updatedAt: '' },
        { id: 'wl-2', name: 'Comedy', itemCount: 2, createdAt: '', updatedAt: '' },
        { id: 'wl-3', name: 'Drama', itemCount: 3, createdAt: '', updatedAt: '' },
        { id: 'wl-4', name: 'Sci-Fi', itemCount: 4, createdAt: '', updatedAt: '' },
      ],
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

    expect(screen.getByText('Show all 4 lists')).toBeTruthy();
    expect(screen.getByLabelText('Add to Sci-Fi')).toBeTruthy();
    expect(screen.getByLabelText('Add to Drama')).toBeTruthy();
    expect(screen.queryByLabelText('Add to Action')).toBeNull();
    expect(screen.queryByLabelText('Add to Comedy')).toBeNull();

    fireEvent.press(screen.getByText('Show all 4 lists'));
    expect(screen.getByLabelText('Add to Action')).toBeTruthy();
  });

  it('closes when the backdrop is pressed', () => {
    const onClose = jest.fn();

    render(
      <WatchlistPickerModal
        visible
        contentType="movie"
        contentId="movie-id"
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByLabelText('Close watchlist picker'));
    expect(onClose).toHaveBeenCalledTimes(1);
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

    expect(screen.getByText('Unable to load watchlists. Please try again.')).toBeTruthy();
  });
});
