import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

jest.mock('@/features/follows/utils/verify-follow-mutation-outcome', () => ({
  verifyTvShowUnfollowed: jest.fn().mockResolvedValue(false),
  verifyTvShowFollowPreferences: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

function renderFollowButton(ui: React.ReactElement = <FollowButton tvShowId={tvShowId} />) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('FollowButton', () => {
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

    renderFollowButton();
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

    renderFollowButton();
    expect(screen.getByLabelText('Manage follow').props.accessibilityState?.selected).toBe(true);
  });

  it('updates follow button to selected state without a success notification', async () => {
    const status = {
      isFollowing: false,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: false,
    };

    (useTvShowFollowStatus as jest.Mock).mockImplementation(() => ({
      data: status,
      isLoading: false,
    }));

    mockCreateMutate.mockImplementation(async () => {
      status.isFollowing = true;
      status.baselineEstablished = true;
    });

    const { rerender } = renderFollowButton();
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));
    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          })
        }
      >
        <FollowButton tvShowId={tvShowId} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Manage follow').props.accessibilityState?.selected).toBe(true);
    });
    expect(screen.queryByText('Following')).toBeNull();
    expect(
      screen.queryByText(
        'Followed. Enable notifications in device settings to receive release alerts.',
      ),
    ).toBeNull();
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

    mockCreateMutate.mockResolvedValue(undefined);

    renderFollowButton();
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
    mockCreateMutate.mockResolvedValue(undefined);

    renderFollowButton();
    fireEvent.press(screen.getByLabelText('Follow this show'));
    await act(async () => {
      fireEvent.press(screen.getByText('Follow show'));
    });

    expect(
      await screen.findByText(
        'Allow notifications so we can alert you about new episodes and releases.',
        {},
        { timeout: 3000 },
      ),
    ).toBeTruthy();
    expect(screen.getByText('Not now')).toBeTruthy();
    expect(screen.getByLabelText('Enable notifications')).toBeTruthy();
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
    mockCreateMutate.mockResolvedValue(undefined);

    renderFollowButton();
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() => {
      expect(screen.queryByText('Enable notifications')).toBeNull();
    });
    expect(screen.queryByText('Following')).toBeNull();
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

    renderFollowButton();
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

  it('shows error feedback in the preferences modal when follow fails', async () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      },
      isLoading: false,
    });

    mockCreateMutate.mockRejectedValue(new Error('Network error'));

    renderFollowButton();
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() =>
      expect(screen.getByText('Could not follow this show. Please try again.')).toBeTruthy(),
    );
    expect(screen.queryByText('Following')).toBeNull();
  });

  it('does not mark follow action busy while follow status is loading', () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderFollowButton();

    expect(screen.getByLabelText('Follow this show').props.accessibilityState?.busy).not.toBe(true);
  });
});
