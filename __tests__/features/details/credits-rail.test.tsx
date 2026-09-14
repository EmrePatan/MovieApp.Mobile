import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CastRail } from '@/features/details/credits/components/CastRail';
import { useMovieCredits, useTvShowCredits } from '@/features/details/credits/hooks/useCredits';

jest.mock('@/features/details/credits/hooks/useCredits', () => ({
  useMovieCredits: jest.fn(),
  useTvShowCredits: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('CastRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTvShowCredits as jest.Mock).mockReturnValue({ isLoading: false, isError: false, data: { cast: [] } });
  });

  it('renders cast names and characters', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        cast: [
          {
            providerPersonId: 1,
            name: 'Matthew McConaughey',
            character: 'Cooper',
            profileImagePath: '/profile.jpg',
            order: 0,
          },
        ],
      },
    });

    render(<CastRail contentType="movie" contentId={movieId} />);

    expect(screen.getByText('Cast')).toBeTruthy();
    expect(screen.getByText('Matthew McConaughey')).toBeTruthy();
    expect(screen.getByText('Cooper')).toBeTruthy();
  });

  it('omits the section when cast is empty', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { cast: [] },
    });

    render(<CastRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('cast-rail')).toBeNull();
    expect(screen.queryByText('Cast')).toBeNull();
  });

  it('omits the section when the query fails', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(<CastRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('cast-rail')).toBeNull();
  });
});
