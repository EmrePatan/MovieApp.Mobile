import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FollowPreferencesModal } from '@/features/follows/components/FollowPreferencesModal';
import {
  useRemoveTvShowFollow,
  useUpdateTvShowFollow,
} from '@/features/follows/hooks/useTvShowFollowMutations';

const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const mockUpdateMutate = jest.fn();
const mockRemoveMutate = jest.fn();

jest.mock('@/features/follows/hooks/useTvShowFollowMutations', () => ({
  useUpdateTvShowFollow: jest.fn(),
  useRemoveTvShowFollow: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('FollowPreferencesModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });
    (useRemoveTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockRemoveMutate,
      isPending: false,
    });
  });

  it('calls PUT when episode preference is toggled', () => {
    render(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
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

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      {
        notifyNewSeasons: true,
        notifyNewEpisodes: false,
      },
      expect.any(Object),
    );
  });

  it('calls DELETE when unfollow is pressed', () => {
    const onClose = jest.fn();

    render(
      <FollowPreferencesModal
        visible
        tvShowId={tvShowId}
        status={{
          isFollowing: true,
          notifyNewSeasons: true,
          notifyNewEpisodes: true,
          baselineEstablished: true,
        }}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByText('Unfollow'));
    expect(mockRemoveMutate).toHaveBeenCalledTimes(1);
  });
});
