import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { FollowPreferencesModal } from '@/features/follows/components/FollowPreferencesModal';
import {
  useCreateTvShowFollow,
  useRemoveTvShowFollow,
  useUpdateTvShowFollow,
} from '@/features/follows/hooks/useTvShowFollowMutations';

const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockRemoveMutate = jest.fn();

jest.mock('@/features/follows/hooks/useTvShowFollowMutations', () => ({
  useCreateTvShowFollow: jest.fn(),
  useUpdateTvShowFollow: jest.fn(),
  useRemoveTvShowFollow: jest.fn(),
}));

jest.mock('@/features/follows/utils/verify-follow-mutation-outcome', () => ({
  verifyTvShowUnfollowed: jest.fn().mockResolvedValue(false),
  verifyTvShowFollowPreferences: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

function renderModal(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('FollowPreferencesModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      mutateAsync: mockCreateMutate,
      isPending: false,
    });
    (useUpdateTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      mutateAsync: mockUpdateMutate,
      isPending: false,
    });
    (useRemoveTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockRemoveMutate,
      mutateAsync: mockRemoveMutate,
      isPending: false,
    });
  });

  it('defaults both options to selected for a new follow', () => {
    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing={false}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('New seasons').props.accessibilityState?.checked).toBe(true);
    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(true);
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('does not render a separate Unfollow action', () => {
    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing
        status={{
          isFollowing: true,
          notifyNewSeasons: true,
          notifyNewEpisodes: true,
          baselineEstablished: true,
        }}
        onClose={jest.fn()}
      />,
    );

    expect(screen.queryByText('Unfollow')).toBeNull();
  });

  it('sends selected preferences when follow is confirmed', async () => {
    mockCreateMutate.mockResolvedValue(undefined);

    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing={false}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('New episodes'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() =>
      expect(mockCreateMutate).toHaveBeenCalledWith({
        notifyNewSeasons: true,
        notifyNewEpisodes: false,
      }),
    );
  });

  it('closes without mutations when a new follow is confirmed with both options off', () => {
    const onClose = jest.fn();
    const onFollowSuccess = jest.fn();

    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing={false}
        onClose={onClose}
        onFollowSuccess={onFollowSuccess}
      />,
    );

    fireEvent.press(screen.getByLabelText('New seasons'));
    fireEvent.press(screen.getByLabelText('New episodes'));
    fireEvent.press(screen.getByText('Follow show'));

    expect(
      screen.getByText('Following with all notifications turned off will not follow this show.'),
    ).toBeTruthy();
    expect(mockCreateMutate).not.toHaveBeenCalled();
    expect(mockRemoveMutate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onFollowSuccess).not.toHaveBeenCalled();
  });

  it('does not mutate when the modal is closed without confirming', () => {
    const onClose = jest.fn();

    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing={false}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('loads persisted preferences for an existing follow', () => {
    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing
        status={{
          isFollowing: true,
          notifyNewSeasons: false,
          notifyNewEpisodes: true,
          baselineEstablished: true,
        }}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('New seasons').props.accessibilityState?.checked).toBe(false);
    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(true);
  });

  it('updates preferences only after save is pressed', async () => {
    mockUpdateMutate.mockResolvedValue(undefined);

    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing
        status={{
          isFollowing: true,
          notifyNewSeasons: true,
          notifyNewEpisodes: true,
          baselineEstablished: true,
        }}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('New episodes'));
    expect(mockUpdateMutate).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Save preferences'));

    await waitFor(() =>
      expect(mockUpdateMutate).toHaveBeenCalledWith({
        notifyNewSeasons: true,
        notifyNewEpisodes: false,
      }),
    );
    expect(mockRemoveMutate).not.toHaveBeenCalled();
  });

  it('still unfollows when optimistic status flips before save', async () => {
    const onClose = jest.fn();
    mockRemoveMutate.mockResolvedValue(undefined);

    const { rerender } = renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing
        status={{
          isFollowing: true,
          notifyNewSeasons: true,
          notifyNewEpisodes: true,
          baselineEstablished: true,
        }}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByLabelText('New seasons'));
    fireEvent.press(screen.getByLabelText('New episodes'));

    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          })
        }
      >
        <FollowPreferencesModal
          visible
          tvShowId={tvShowId}
          isFollowing={false}
          status={{
            isFollowing: false,
            notifyNewSeasons: true,
            notifyNewEpisodes: true,
            baselineEstablished: false,
          }}
          onClose={onClose}
        />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByText('Save preferences'));

    await waitFor(() => expect(mockRemoveMutate).toHaveBeenCalledTimes(1));
    expect(mockUpdateMutate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls DELETE when saving an existing follow with both options off', async () => {
    const onClose = jest.fn();
    mockRemoveMutate.mockResolvedValue(undefined);

    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing
        status={{
          isFollowing: true,
          notifyNewSeasons: true,
          notifyNewEpisodes: true,
          baselineEstablished: true,
        }}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByLabelText('New seasons'));
    fireEvent.press(screen.getByLabelText('New episodes'));
    fireEvent.press(screen.getByText('Save preferences'));

    expect(
      screen.getByText('Saving with all notifications turned off will unfollow this show.'),
    ).toBeTruthy();
    await waitFor(() => expect(mockRemoveMutate).toHaveBeenCalledTimes(1));
    expect(mockUpdateMutate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps local toggles when follow status refreshes before save', () => {
    const status = {
      isFollowing: true,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: true,
    };

    const { rerender } = renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing
        status={status}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('New episodes'));
    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(false);

    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          })
        }
      >
        <FollowPreferencesModal
          visible
          tvShowId={tvShowId}
          isFollowing
          status={{
            ...status,
            notifyNewEpisodes: true,
          }}
          onClose={jest.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(false);
  });

  it('keeps modal state and shows an error when unfollow fails', async () => {
    mockRemoveMutate.mockRejectedValue(new Error('Network error'));

    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing
        status={{
          isFollowing: true,
          notifyNewSeasons: true,
          notifyNewEpisodes: true,
          baselineEstablished: true,
        }}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('New seasons'));
    fireEvent.press(screen.getByLabelText('New episodes'));
    fireEvent.press(screen.getByText('Save preferences'));

    await waitFor(() =>
      expect(screen.getByText('Could not unfollow this show. Please try again.')).toBeTruthy(),
    );
    expect(screen.getByLabelText('New seasons').props.accessibilityState?.checked).toBe(false);
    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(false);
  });

  it('keeps modal state and shows an error when save fails', async () => {
    mockUpdateMutate.mockRejectedValue(new Error('Network error'));

    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing
        status={{
          isFollowing: true,
          notifyNewSeasons: true,
          notifyNewEpisodes: true,
          baselineEstablished: true,
        }}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('New episodes'));
    fireEvent.press(screen.getByText('Save preferences'));

    await waitFor(() =>
      expect(
        screen.getByText('Could not update follow preferences. Please try again.'),
      ).toBeTruthy(),
    );
    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(false);
  });

  it('shows baseline failure message on 503 without closing', async () => {
    mockCreateMutate.mockRejectedValue(
      new ApiError({
        kind: 'server',
        status: 503,
        title: 'Service unavailable',
        detail: null,
        userMessage: 'Service unavailable',
        message: 'Service unavailable',
      }),
    );

    renderModal(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing={false}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() =>
      expect(
        screen.getByText('Could not finish follow setup right now. Please try again.'),
      ).toBeTruthy(),
    );
    expect(screen.getByText('Follow show')).toBeTruthy();
  });
});
