import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { useAuth } from '@/auth/useAuth';
import { useMyReview } from '@/features/reviews/hooks/useMyReview';
import { useMovieReviews } from '@/features/reviews/hooks/useMovieReviews';
import { useTvShowReviews } from '@/features/reviews/hooks/useTvShowReviews';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '@/features/reviews/hooks/useReviewMutations';
import type { ReviewResponse } from '@/features/reviews/types';

const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockDeleteMutate = jest.fn();
const mockFetchNextPage = jest.fn();
const mockRefetch = jest.fn();
const mockRequireAuth = jest.fn(() => true);

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/reviews/hooks/useMovieReviews', () => ({
  useMovieReviews: jest.fn(),
}));

jest.mock('@/features/reviews/hooks/useTvShowReviews', () => ({
  useTvShowReviews: jest.fn(),
}));

jest.mock('@/features/reviews/hooks/useMyReview', () => ({
  useMyReview: jest.fn(),
}));

jest.mock('@/features/reviews/hooks/useReviewMutations', () => ({
  useCreateReviewMutation: jest.fn(),
  useUpdateReviewMutation: jest.fn(),
  useDeleteReviewMutation: jest.fn(),
}));

const mockScrollToCenter = jest.fn();

jest.mock('@/features/details/shared/context/DetailScrollContext', () => ({
  useDetailScroll: () => ({
    scrollToCenter: mockScrollToCenter,
  }),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const userId = 'user-id';

const otherReview: ReviewResponse = {
  id: 'other-review',
  user: { id: 'other-user', displayName: 'Alex Smith' },
  content: 'Solid watch.',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const myReview: ReviewResponse = {
  id: 'my-review',
  user: { id: userId, displayName: 'Jane Doe' },
  content: 'My take on this title.',
  createdAt: '2026-01-02T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

function mockReviewsQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      pages: [
        {
          items: [otherReview],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetching: false,
    fetchNextPage: mockFetchNextPage,
    refetch: mockRefetch,
    ...overrides,
  };
}

describe('ReviewsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: userId },
    });
    (useMovieReviews as jest.Mock).mockReturnValue(mockReviewsQuery());
    (useTvShowReviews as jest.Mock).mockReturnValue(mockReviewsQuery());
    (useMyReview as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    (useCreateReviewMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });
    (useUpdateReviewMutation as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });
    (useDeleteReviewMutation as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });
  });

  it('renders review count and public reviews', () => {
    render(<ReviewsSection contentType="movie" contentId={movieId} />);

    expect(screen.getByText('Reviews')).toBeTruthy();
    expect(screen.getByLabelText('1 review')).toBeTruthy();
    expect(screen.getByText('Alex Smith')).toBeTruthy();
    expect(screen.getByText('Solid watch.')).toBeTruthy();
  });

  it('shows empty state when there are no reviews', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          pages: [
            {
              items: [],
              page: 1,
              pageSize: 20,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          ],
        },
      }),
    );

    render(<ReviewsSection contentType="movie" contentId={movieId} />);
    expect(screen.getByText('No reviews yet')).toBeTruthy();
    expect(screen.getByText('Be the first to share your thoughts.')).toBeTruthy();
  });

  it('shows error with retry', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: undefined,
        isError: true,
        error: new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }),
      }),
    );

    render(<ReviewsSection contentType="movie" contentId={movieId} />);
    expect(screen.getByText('Server error.')).toBeTruthy();
    fireEvent.press(screen.getByText('Try Again'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('prompts login when writing a review while logged out', () => {
    mockRequireAuth.mockReturnValue(false);

    render(<ReviewsSection contentType="movie" contentId={movieId} />);
    fireEvent.press(screen.getByText('Write a review'));

    expect(mockCreateMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Please sign in to write a review.')).toBeTruthy();
  });

  it('opens composer and submits a new review', async () => {
    render(<ReviewsSection contentType="movie" contentId={movieId} />);

    fireEvent.press(screen.getByText('Write a review'));
    expect(screen.getByTestId('review-composer-anchor')).toBeTruthy();
    await waitFor(() => {
      expect(mockScrollToCenter).toHaveBeenCalled();
    });
    fireEvent.changeText(screen.getByLabelText('Review'), 'Great film.');
    fireEvent.press(screen.getByText('Post review'));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { content: 'Great film.' },
      expect.any(Object),
    );
  });

  it('shows current user review with edit and delete actions', () => {
    (useMyReview as jest.Mock).mockReturnValue({
      data: myReview,
      isLoading: false,
    });

    render(<ReviewsSection contentType="movie" contentId={movieId} />);

    expect(screen.getByText('Your review')).toBeTruthy();
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('You')).toBeTruthy();
    expect(screen.queryByText('Write a review')).toBeNull();
  });

  it('edits own review', () => {
    (useMyReview as jest.Mock).mockReturnValue({
      data: myReview,
      isLoading: false,
    });

    render(<ReviewsSection contentType="movie" contentId={movieId} />);

    fireEvent.press(screen.getByLabelText('Edit review'));
    fireEvent.changeText(screen.getByLabelText('Review'), 'Updated take.');
    fireEvent.press(screen.getByText('Save review'));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      { content: 'Updated take.' },
      expect.any(Object),
    );
  });

  it('confirms before deleting own review', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Delete')?.onPress?.();
    });

    (useMyReview as jest.Mock).mockReturnValue({
      data: myReview,
      isLoading: false,
    });

    render(<ReviewsSection contentType="movie" contentId={movieId} />);
    fireEvent.press(screen.getByLabelText('Delete review'));

    expect(alertSpy).toHaveBeenCalled();
    expect(mockDeleteMutate).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('loads more reviews when next page is available', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        hasNextPage: true,
      }),
    );

    render(<ReviewsSection contentType="movie" contentId={movieId} />);
    fireEvent.press(screen.getByText('Load more reviews'));
    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('uses tv review query for tv content', () => {
    render(<ReviewsSection contentType="tv" contentId={movieId} />);
    expect(useTvShowReviews).toHaveBeenCalledWith(movieId);
  });
});
