import mockReact from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton';

const mockRequireAuth = jest.fn(() => true);
const mockUseWatchlistMembership = jest.fn(() => ({
  data: {},
  isLoading: false,
}));

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/watchlists/hooks/useWatchlists', () => ({
  useWatchlistMembership: (...args: unknown[]) => mockUseWatchlistMembership(...args),
}));

jest.mock('@/features/watchlists/components/WatchlistPickerModal', () => ({
  WatchlistPickerModal: ({ visible }: { visible: boolean }) =>
    visible
      ? mockReact.createElement('Text', { testID: 'watchlist-modal' }, 'Watchlist modal open')
      : null,
}));

describe('AddToWatchlistButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);
    mockUseWatchlistMembership.mockReturnValue({
      data: {},
      isLoading: false,
    });
  });

  it('opens watchlist modal when authenticated', () => {
    render(<AddToWatchlistButton contentType="movie" contentId="movie-id" />);
    fireEvent.press(screen.getByText('Add to Watchlist'));
    expect(screen.getByTestId('watchlist-modal')).toBeTruthy();
  });

  it('shows selected state when content is in a watchlist', () => {
    mockUseWatchlistMembership.mockReturnValue({
      data: { 'wl-1': true, 'wl-2': false },
      isLoading: false,
    });

    render(<AddToWatchlistButton contentType="movie" contentId="movie-id" variant="icon" />);

    const button = screen.getByLabelText('In watchlist');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityState?.selected).toBe(true);
  });

  it('updates button title when content is in a watchlist', () => {
    mockUseWatchlistMembership.mockReturnValue({
      data: { 'wl-1': true },
      isLoading: false,
    });

    render(<AddToWatchlistButton contentType="movie" contentId="movie-id" />);

    expect(screen.getByText('In Watchlist')).toBeTruthy();
  });

  it('prompts login when unauthenticated', () => {
    mockRequireAuth.mockReturnValue(false);

    render(<AddToWatchlistButton contentType="tv" contentId="tv-id" />);
    fireEvent.press(screen.getByText('Add to Watchlist'));

    expect(screen.getByText('Please sign in to use watchlists.')).toBeTruthy();
  });
});
