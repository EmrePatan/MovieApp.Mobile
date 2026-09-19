import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailInlineRatingSection } from '@/features/ratings/components/DetailInlineRatingSection';
import { useMyRating, useRatingAggregate } from '@/features/ratings/hooks/useRatings';
import { useDeleteRating, useRateContent } from '@/features/ratings/hooks/useRatingMutations';

const mockMutate = jest.fn();
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

function setup({
  score = 6,
  isRatePending = false,
}: {
  score?: number | null;
  isRatePending?: boolean;
} = {}) {
  (useMyRating as jest.Mock).mockReturnValue({
    data: score != null ? { score } : null,
    isLoading: false,
  });
  (useRatingAggregate as jest.Mock).mockReturnValue({
    data: { averageScore: 7.5, ratingCount: 42, scoreDistribution: {} },
    isLoading: false,
    isError: false,
  });
  (useRateContent as jest.Mock).mockReturnValue({
    mutate: mockMutate,
    isPending: isRatePending,
  });
  (useDeleteRating as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  });
}

describe('half-star optimistic rating transitions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);
  });

  it('renders 3.5 stars from backend score 7 without flicker to whole stars', () => {
    setup({ score: 7 });

    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.getByTestId('star-3-full')).toBeTruthy();
    expect(screen.getByTestId('star-4-half')).toBeTruthy();
    expect(screen.getByTestId('star-5-empty')).toBeTruthy();
    expect(screen.queryByTestId('star-4-full')).toBeNull();
    expect(screen.queryByTestId('star-3-half')).toBeNull();
  });

  it('commits 3.5 stars and keeps half-star visible while pending', () => {
    setup({ score: 6 });

    const { rerender } = render(
      <DetailInlineRatingSection contentType="movie" contentId="movie-id" />,
    );

    fireEvent(screen.getByLabelText('Your Rating'), 'onAccessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(mockMutate).toHaveBeenCalledWith(7, expect.objectContaining({
      onError: expect.any(Function),
      onSuccess: expect.any(Function),
    }));

    setup({ score: 6, isRatePending: true });
    rerender(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.getByTestId('star-3-full')).toBeTruthy();
    expect(screen.getByTestId('star-4-half')).toBeTruthy();
  });

  it('rolls back to previous rating after failed mutation', () => {
    setup({ score: 6 });
    mockMutate.mockImplementation((_score: number, options?: { onError?: () => void }) => {
      options?.onError?.();
    });

    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    fireEvent(screen.getByLabelText('Your Rating'), 'onAccessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(screen.getByTestId('star-3-full')).toBeTruthy();
    expect(screen.getByTestId('star-4-empty')).toBeTruthy();
    expect(screen.queryByTestId('star-4-half')).toBeNull();
    expect(screen.getByText('Unable to save rating. Please try again.')).toBeTruthy();
  });
});
