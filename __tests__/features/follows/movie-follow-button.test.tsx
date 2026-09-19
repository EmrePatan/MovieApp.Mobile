import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MovieFollowButton } from '@/features/follows/components/MovieFollowButton';
import { useMovieFollowStatus } from '@/features/follows/hooks/useMovieFollowStatus';
import {
  useCreateMovieFollow,
  useRemoveMovieFollow,
} from '@/features/follows/hooks/useMovieFollowMutations';
import { ensurePushDeviceRegisteredAsync } from '@/features/follows/services/push-device-service';

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
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

  it('renders when mounted by parent eligibility gate', () => {
    render(<MovieFollowButton movieId={movieId} />);
    expect(screen.getByLabelText('Notify me when released')).toBeTruthy();
  });

  it('registers push device after successful new follow only', async () => {
    mockCreateMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.();
    });

    render(<MovieFollowButton movieId={movieId} />);
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

    render(<MovieFollowButton movieId={movieId} />);
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

    render(<MovieFollowButton movieId={movieId} />);
    expect(screen.getByLabelText('Release alert on').props.accessibilityState?.selected).toBe(true);
  });

  describe('detail optimistic UX', () => {
    it('shows spinner only while initial status is unresolved', () => {
      (useMovieFollowStatus as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<MovieFollowButton movieId={movieId} />);

      const button = screen.getByLabelText('Notify me when released');
      expect(button.props.accessibilityState.busy).toBe(true);
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('keeps icon visible while mutation is pending', () => {
      (useCreateMovieFollow as jest.Mock).mockReturnValue({
        mutate: mockCreateMutate,
        isPending: true,
      });

      render(<MovieFollowButton movieId={movieId} />);

      const button = screen.getByLabelText('Notify me when released');
      expect(button.props.accessibilityState.busy).toBe(false);
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('prevents duplicate mutation while pending', () => {
      (useCreateMovieFollow as jest.Mock).mockReturnValue({
        mutate: mockCreateMutate,
        isPending: true,
      });

      render(<MovieFollowButton movieId={movieId} />);
      fireEvent.press(screen.getByLabelText('Notify me when released'));

      expect(mockCreateMutate).not.toHaveBeenCalled();
    });
  });
});
