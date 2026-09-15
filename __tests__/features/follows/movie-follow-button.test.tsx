import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MovieFollowButton } from '@/features/follows/components/MovieFollowButton';
import { useMovieFollowStatus } from '@/features/follows/hooks/useMovieFollowStatus';
import {
  useCreateMovieFollow,
  useRemoveMovieFollow,
} from '@/features/follows/hooks/useMovieFollowMutations';
import { ensurePushDeviceRegisteredAsync } from '@/features/follows/services/push-device-service';
import * as dateUtils from '@/utils/date';

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const futureReleaseDate = '2026-03-15';
const pastReleaseDate = '2020-01-01';
const mockRequireAuth = jest.fn(() => true);
const mockCreateMutate = jest.fn();
const mockRemoveMutate = jest.fn();

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/follows/hooks/useMovieFollowStatus', () => ({
  useMovieFollowStatus: jest.fn(),
}));

jest.mock('@/features/follows/hooks/useMovieFollowMutations', () => ({
  useCreateMovieFollow: jest.fn(),
  useRemoveMovieFollow: jest.fn(),
}));

jest.mock('@/features/follows/services/push-device-service', () => ({
  ensurePushDeviceRegisteredAsync: jest.fn(),
}));

describe('MovieFollowButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(dateUtils, 'isFutureReleaseDate').mockImplementation(
      (releaseDate) => releaseDate === futureReleaseDate,
    );
    (useCreateMovieFollow as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });
    (useRemoveMovieFollow as jest.Mock).mockReturnValue({
      mutate: mockRemoveMutate,
      isPending: false,
    });
    (ensurePushDeviceRegisteredAsync as jest.Mock).mockResolvedValue('registered');
    (useMovieFollowStatus as jest.Mock).mockReturnValue({
      data: { isFollowing: false },
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders for a future release date', () => {
    render(<MovieFollowButton movieId={movieId} releaseDate={futureReleaseDate} />);
    expect(screen.getByLabelText('Notify me when released')).toBeTruthy();
  });

  it('does not render for a past release date', () => {
    render(<MovieFollowButton movieId={movieId} releaseDate={pastReleaseDate} />);
    expect(screen.queryByLabelText('Notify me when released')).toBeNull();
    expect(screen.queryByLabelText('Release alert on')).toBeNull();
  });

  it('does not render when release date is null', () => {
    render(<MovieFollowButton movieId={movieId} releaseDate={null} />);
    expect(screen.queryByLabelText('Notify me when released')).toBeNull();
  });

  it('registers push device after successful new follow only', async () => {
    mockCreateMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.();
    });

    render(<MovieFollowButton movieId={movieId} releaseDate={futureReleaseDate} />);
    fireEvent.press(screen.getByLabelText('Notify me when released'));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
      expect(ensurePushDeviceRegisteredAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('does not register push when unfollowing', () => {
    (useMovieFollowStatus as jest.Mock).mockReturnValue({
      data: { isFollowing: true },
      isLoading: false,
    });

    render(<MovieFollowButton movieId={movieId} releaseDate={futureReleaseDate} />);
    fireEvent.press(screen.getByLabelText('Release alert on'));

    expect(mockRemoveMutate).toHaveBeenCalledTimes(1);
    expect(mockCreateMutate).not.toHaveBeenCalled();
    expect(ensurePushDeviceRegisteredAsync).not.toHaveBeenCalled();
  });

  it('shows active state when following', () => {
    (useMovieFollowStatus as jest.Mock).mockReturnValue({
      data: { isFollowing: true },
      isLoading: false,
    });

    render(<MovieFollowButton movieId={movieId} releaseDate={futureReleaseDate} />);
    expect(screen.getByLabelText('Release alert on').props.accessibilityState?.selected).toBe(true);
  });
});
