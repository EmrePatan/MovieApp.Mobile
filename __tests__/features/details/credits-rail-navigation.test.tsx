import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CastRail } from '@/features/details/credits/components/CastRail';
import { useMovieCredits, useTvShowCredits } from '@/features/details/credits/hooks/useCredits';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/features/details/credits/hooks/useCredits', () => ({
  useMovieCredits: jest.fn(),
  useTvShowCredits: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('CastRail navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTvShowCredits as jest.Mock).mockReturnValue({ isLoading: false, isError: false, data: { cast: [] } });
  });

  it('navigates to person detail when a cast member is pressed', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        cast: [
          {
            providerPersonId: 1001,
            name: 'Matthew McConaughey',
            character: 'Cooper',
            profileImagePath: '/profile.jpg',
            order: 0,
          },
        ],
      },
    });

    render(<CastRail contentType="movie" contentId={movieId} />);
    fireEvent.press(screen.getByLabelText('View Matthew McConaughey'));

    expect(mockPush).toHaveBeenCalledWith('/person/1001');
  });
});
