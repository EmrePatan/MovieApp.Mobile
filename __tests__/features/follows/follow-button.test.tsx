import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { useTvShowFollowStatus } from '@/features/follows/hooks/useTvShowFollowStatus';
import {
  useCreateTvShowFollow,
  useRemoveTvShowFollow,
  useUpdateTvShowFollow,
} from '@/features/follows/hooks/useTvShowFollowMutations';
import { ensurePushDeviceRegisteredAsync } from '@/features/follows/services/push-device-service';
import { getNotificationPermissionState } from '@/features/follows/services/notification-permission-service';
import { isNotificationPermissionPromptDismissed } from '@/features/follows/services/notification-permission-prompt-storage';

const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const mockRequireAuth = jest.fn(() => true);
const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockRemoveMutate = jest.fn();

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/follows/hooks/useTvShowFollowStatus', () => ({
  useTvShowFollowStatus: jest.fn(),
}));

jest.mock('@/features/follows/hooks/useTvShowFollowMutations', () => ({
  useCreateTvShowFollow: jest.fn(),
  useRemoveTvShowFollow: jest.fn(),
  useUpdateTvShowFollow: jest.fn(),
}));

jest.mock('@/features/follows/services/push-device-service', () => ({
  ensurePushDeviceRegisteredAsync: jest.fn(),
}));

jest.mock('@/features/follows/services/notification-permission-service', () => ({
  getNotificationPermissionState: jest.fn(),
  requestNotificationPermissionAsync: jest.fn(),
  openNotificationSettingsAsync: jest.fn(),
}));

jest.mock('@/features/follows/services/notification-permission-prompt-storage', () => ({
  isNotificationPermissionPromptDismissed: jest.fn(),
  markNotificationPermissionPromptDismissed: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('FollowButton', () => {
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
    (ensurePushDeviceRegisteredAsync as jest.Mock).mockResolvedValue('registered');
    (getNotificationPermissionState as jest.Mock).mockResolvedValue('granted');
    (isNotificationPermissionPromptDismissed as jest.Mock).mockResolvedValue(false);
  });

  it('opens the modal without creating a follow when inactive button is tapped', () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      },
      isLoading: false,
    });

    render(<FollowButton tvShowId={tvShowId} />);
    fireEvent.press(screen.getByLabelText('Follow this show'));

    expect(screen.getByText('Follow this show')).toBeTruthy();
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('shows active state when following', () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: true,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: true,
      },
      isLoading: false,
    });

    render(<FollowButton tvShowId={tvShowId} />);
    expect(screen.getByLabelText('Manage follow').props.accessibilityState?.selected).toBe(true);
  });

  it('shows compact success feedback after follow confirmation', async () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      },
      isLoading: false,
    });

    mockCreateMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.();
    });

    render(<FollowButton tvShowId={tvShowId} />);
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() => {
      expect(screen.getByText('Following')).toBeTruthy();
      expect(
        screen.queryByText(
          'Followed. Enable notifications in device settings to receive release alerts.',
        ),
      ).toBeNull();
    });
  });

  it('registers push device when permission is already granted', async () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      },
      isLoading: false,
    });

    mockCreateMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.();
    });

    render(<FollowButton tvShowId={tvShowId} />);
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() => {
      expect(ensurePushDeviceRegisteredAsync).toHaveBeenCalledWith({ allowPermissionRequest: false });
    });
  });

  it('opens permission guidance modal when notifications are not granted', async () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      },
      isLoading: false,
    });
    (getNotificationPermissionState as jest.Mock).mockResolvedValue('requestable');
    mockCreateMutate.mockImplementation((_variables, options) => {
      void Promise.resolve(options?.onSuccess?.());
    });

    render(<FollowButton tvShowId={tvShowId} />);
    fireEvent.press(screen.getByLabelText('Follow this show'));
    await act(async () => {
      fireEvent.press(screen.getByText('Follow show'));
    });

    expect(await screen.findByText('Enable notifications', {}, { timeout: 3000 })).toBeTruthy();
    expect(
      screen.getByText('Allow notifications so we can alert you about new episodes and releases.'),
    ).toBeTruthy();
  });

  it('does not reopen permission guidance after it was dismissed', async () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      },
      isLoading: false,
    });
    (getNotificationPermissionState as jest.Mock).mockResolvedValue('requestable');
    (isNotificationPermissionPromptDismissed as jest.Mock).mockResolvedValue(true);
    mockCreateMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.();
    });

    render(<FollowButton tvShowId={tvShowId} />);
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() => {
      expect(screen.getByText('Following')).toBeTruthy();
      expect(screen.queryByText('Enable notifications')).toBeNull();
    });
  });

  it('does not register push when follow is confirmed with both options off', async () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      },
      isLoading: false,
    });

    render(<FollowButton tvShowId={tvShowId} />);
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByLabelText('New seasons'));
    fireEvent.press(screen.getByLabelText('New episodes'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() => {
      expect(mockCreateMutate).not.toHaveBeenCalled();
      expect(mockRemoveMutate).not.toHaveBeenCalled();
      expect(ensurePushDeviceRegisteredAsync).not.toHaveBeenCalled();
    });
  });

  it('does not call create while follow status is loading', () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<FollowButton tvShowId={tvShowId} />);

    expect(screen.getByLabelText('Follow this show').props.accessibilityState?.busy).toBe(true);
  });
});
