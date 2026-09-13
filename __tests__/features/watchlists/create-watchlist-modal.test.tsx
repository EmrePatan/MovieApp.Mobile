import { TextInput } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CreateWatchlistModal } from '@/features/watchlists/components/CreateWatchlistModal';
import { useCreateWatchlistForLibrary } from '@/features/watchlists/hooks/useWatchlistMutations';

jest.mock('@/features/watchlists/hooks/useWatchlistMutations', () => ({
  useCreateWatchlistForLibrary: jest.fn(),
}));

describe('CreateWatchlistModal', () => {
  const mutate = jest.fn();
  const onClose = jest.fn();
  const onCreated = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (useCreateWatchlistForLibrary as jest.Mock).mockReturnValue({
      mutate,
      isPending: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('focuses the name input when opened', () => {
    const focusSpy = jest.spyOn(TextInput.prototype, 'focus').mockImplementation(jest.fn());

    render(
      <CreateWatchlistModal visible onClose={onClose} onCreated={onCreated} />,
    );

    jest.advanceTimersByTime(280);

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it('shows validation feedback for empty name', () => {
    render(
      <CreateWatchlistModal visible onClose={onClose} onCreated={onCreated} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Create Watchlist' }));
    expect(screen.getByText('Enter a watchlist name.')).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('creates watchlist and notifies parent', () => {
    mutate.mockImplementation((_name, options) => {
      options?.onSuccess?.({ id: 'new-watchlist-id', name: 'Sci-Fi' });
    });

    render(
      <CreateWatchlistModal visible onClose={onClose} onCreated={onCreated} />,
    );

    fireEvent.changeText(screen.getByLabelText('Watchlist name'), 'Sci-Fi');
    fireEvent.press(screen.getByRole('button', { name: 'Create Watchlist' }));

    expect(mutate).toHaveBeenCalledWith('Sci-Fi', expect.any(Object));
    expect(onCreated).toHaveBeenCalledWith('new-watchlist-id');
    expect(onClose).toHaveBeenCalled();
  });
});
