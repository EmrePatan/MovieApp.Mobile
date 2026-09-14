import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
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

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('FollowPreferencesModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });
    (useUpdateTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });
    (useRemoveTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockRemoveMutate,
      isPending: false,
    });
  });

  it('defaults both options to selected for a new follow', () => {
    render(
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
    render(
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

  it('sends selected preferences when follow is confirmed', () => {
    render(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing={false}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('New episodes'));
    fireEvent.press(screen.getByText('Follow show'));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      {
        notifyNewSeasons: true,
        notifyNewEpisodes: false,
      },
      expect.any(Object),
    );
  });

  it('closes without mutations when a new follow is confirmed with both options off', () => {
    const onClose = jest.fn();
    const onFollowSuccess = jest.fn();

    render(
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

    render(
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
    render(
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

  it('updates preferences only after save is pressed', () => {
    render(
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

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      {
        notifyNewSeasons: true,
        notifyNewEpisodes: false,
      },
      expect.any(Object),
    );
    expect(mockRemoveMutate).not.toHaveBeenCalled();
  });

  it('calls DELETE when saving an existing follow with both options off', () => {
    const onClose = jest.fn();
    mockRemoveMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.();
    });

    render(
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
    expect(mockRemoveMutate).toHaveBeenCalledTimes(1);
    expect(mockUpdateMutate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps modal state and shows an error when unfollow fails', () => {
    mockRemoveMutate.mockImplementation((_variables, options) => {
      options?.onError?.();
    });

    render(
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

    expect(screen.getByText('Could not unfollow this show. Please try again.')).toBeTruthy();
    expect(screen.getByLabelText('New seasons').props.accessibilityState?.checked).toBe(false);
    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(false);
  });

  it('keeps modal state and shows an error when save fails', () => {
    mockUpdateMutate.mockImplementation((_variables, options) => {
      options?.onError?.();
    });

    render(
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

    expect(
      screen.getByText('Could not update follow preferences. Please try again.'),
    ).toBeTruthy();
    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(false);
  });

  it('shows baseline failure message on 503 without closing', () => {
    mockCreateMutate.mockImplementation((_variables, options) => {
      options?.onError?.(
        new ApiError({
          kind: 'server',
          status: 503,
          title: 'Service unavailable',
          detail: null,
          userMessage: 'Service unavailable',
          message: 'Service unavailable',
        }),
      );
    });

    render(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        isFollowing={false}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText('Follow show'));

    expect(
      screen.getByText('Could not finish follow setup right now. Please try again.'),
    ).toBeTruthy();
    expect(screen.getByText('Follow show')).toBeTruthy();
  });
});
