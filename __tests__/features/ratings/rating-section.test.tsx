import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RatingSection } from '@/features/ratings/components/RatingSection';
import { useMyRating, useRatingAggregate } from '@/features/ratings/hooks/useRatings';
import { useDeleteRating, useRateContent } from '@/features/ratings/hooks/useRatingMutations';

const mockMutate = jest.fn();
const mockDeleteMutate = jest.fn();
const mockRequireAuth = jest.fn(() => true);

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/ratings/hooks/useRatings', () => ({
  useMyRating: jest.fn(),
  useRatingAggregate: jest.fn(),
}));

jest.mock('@/features/ratings/hooks/useRatingMutations', () => ({
  useRateContent: jest.fn(),
  useDeleteRating: jest.fn(),
}));

describe('RatingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);
    (useMyRating as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: { averageScore: 7.5, ratingCount: 42, scoreDistribution: {} },
      isLoading: false,
      isError: false,
    });
    (useRateContent as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    (useDeleteRating as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });
  });

  it('renders own rating and aggregate separately', () => {
    (useMyRating as jest.Mock).mockReturnValue({
      data: { score: 8 },
      isLoading: false,
    });

    render(<RatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.getByText('Your Rating')).toBeTruthy();
    expect(screen.getByText('You rated this 8/10.')).toBeTruthy();
    expect(screen.getByText('Community average: ★ 7.5 (42 ratings)')).toBeTruthy();
  });

  it('submits a rating', () => {
    render(<RatingSection contentType="tv" contentId="tv-id" />);
    fireEvent.press(screen.getByLabelText('Rate 9 out of 10'));
    expect(mockMutate).toHaveBeenCalledWith(9, expect.any(Object));
  });

  it('removes a rating', () => {
    (useMyRating as jest.Mock).mockReturnValue({
      data: { score: 6 },
      isLoading: false,
    });

    render(<RatingSection contentType="movie" contentId="movie-id" />);
    fireEvent.press(screen.getByText('Remove My Rating'));
    expect(mockDeleteMutate).toHaveBeenCalled();
  });

  it('prompts login when unauthenticated', () => {
    mockRequireAuth.mockReturnValue(false);

    render(<RatingSection contentType="movie" contentId="movie-id" />);
    fireEvent.press(screen.getByLabelText('Rate 5 out of 10'));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Please sign in to rate this title.')).toBeTruthy();
  });
});
