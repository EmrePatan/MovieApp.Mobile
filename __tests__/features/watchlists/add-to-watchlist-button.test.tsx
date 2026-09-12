import mockReact from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton';

const mockRequireAuth = jest.fn(() => true);

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
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
  });

  it('opens watchlist modal when authenticated', () => {
    render(<AddToWatchlistButton contentType="movie" contentId="movie-id" />);
    fireEvent.press(screen.getByText('Add to Watchlist'));
    expect(screen.getByTestId('watchlist-modal')).toBeTruthy();
  });

  it('prompts login when unauthenticated', () => {
    mockRequireAuth.mockReturnValue(false);

    render(<AddToWatchlistButton contentType="tv" contentId="tv-id" />);
    fireEvent.press(screen.getByText('Add to Watchlist'));

    expect(screen.getByText('Please sign in to use watchlists.')).toBeTruthy();
  });
});
