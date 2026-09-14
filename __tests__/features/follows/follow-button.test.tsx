import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { useTvShowFollowStatus } from '@/features/follows/hooks/useTvShowFollowStatus';
import {
  useCreateTvShowFollow,
  useRemoveTvShowFollow,
  useUpdateTvShowFollow,
} from '@/features/follows/hooks/useTvShowFollowMutations';
import { ensurePushDeviceRegisteredAsync } from '@/features/follows/services/push-device-service';

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
  useUpdateTvShowFollow: jest.fn(),
  useRemoveTvShowFollow: jest.fn(),
}));

jest.mock('@/features/follows/services/push-device-service', () => ({
  ensurePushDeviceRegisteredAsync: jest.fn(),
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

  it('opens preferences when active follow is tapped', () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: true,
        notifyNewSeasons: false,
        notifyNewEpisodes: true,
        baselineEstablished: true,
      },
      isLoading: false,
    });

    render(<FollowButton tvShowId={tvShowId} />);
    fireEvent.press(screen.getByLabelText('Manage follow'));

    expect(screen.getByText('Follow preferences')).toBeTruthy();
    expect(screen.getByLabelText('New seasons').props.accessibilityState?.checked).toBe(false);
    expect(screen.getByLabelText('New episodes').props.accessibilityState?.checked).toBe(true);
  });

  it('registers push device after successful follow confirmation', async () => {
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
      expect(mockCreateMutate).toHaveBeenCalledWith(
        {
          notifyNewSeasons: true,
          notifyNewEpisodes: true,
        },
        expect.any(Object),
      );
      expect(ensurePushDeviceRegisteredAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps follow active when permission is denied after confirmation', async () => {
    (useTvShowFollowStatus as jest.Mock).mockReturnValue({
      data: {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      },
      isLoading: false,
    });
    (ensurePushDeviceRegisteredAsync as jest.Mock).mockResolvedValue('permission_denied');
    mockCreateMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.();
    });

    render(<FollowButton tvShowId={tvShowId} />);
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Followed. Enable notifications in device settings to receive release alerts.',
        ),
      ).toBeTruthy();
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
