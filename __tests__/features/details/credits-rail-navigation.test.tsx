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
    (useTvShowCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { cast: [], crew: [] },
    });
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
            roles: null,
            totalEpisodeCount: null,
            profileImagePath: '/profile.jpg',
            order: 0,
          },
        ],
        crew: [],
      },
    });

    render(<CastRail contentType="movie" contentId={movieId} />);
    fireEvent.press(screen.getByLabelText('View Matthew McConaughey'));

    expect(mockPush).toHaveBeenCalledWith('/person/1001');
  });

  it('navigates to credits detail with title when See All is pressed', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        cast: [
          {
            providerPersonId: 1001,
            name: 'Matthew McConaughey',
            character: 'Cooper',
            roles: null,
            totalEpisodeCount: null,
            profileImagePath: '/profile.jpg',
            order: 0,
          },
        ],
        crew: [
          {
            providerPersonId: 2001,
            name: 'Christopher Nolan',
            job: 'Director',
            department: 'Directing',
            profileImagePath: null,
          },
        ],
      },
    });

    render(<CastRail contentType="movie" contentId={movieId} title="Interstellar" />);
    fireEvent.press(screen.getByLabelText('See all Cast & Crew'));

    expect(mockPush).toHaveBeenCalledWith(
      `/movie/${movieId}/credits?title=Interstellar`,
    );
  });
});
