import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { ReviewsDetailContent } from '@/features/reviews/components/ReviewsDetailContent';
import { useAuth } from '@/auth/useAuth';
import { useMyRating, useRatingAggregate } from '@/features/ratings/hooks/useRatings';
import { useMyReview } from '@/features/reviews/hooks/useMyReview';
import { useMovieReviews } from '@/features/reviews/hooks/useMovieReviews';
import { useTvShowReviews } from '@/features/reviews/hooks/useTvShowReviews';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '@/features/reviews/hooks/useReviewMutations';
jest.mock('@/features/reviews/components/ReviewTranslationControls', () => {
  const React = require('react');
  const { Text: NativeText } = require('react-native');

  return {
    ReviewTranslationControls: ({
      review,
      numberOfLines,
    }: {
      review: { content: string };
      numberOfLines?: number;
    }) => React.createElement(NativeText, { numberOfLines }, review.content),
  };
});

const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockDeleteMutate = jest.fn();
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

jest.mock('@/features/ratings/hooks/useRatings', () => ({
  useMyRating: jest.fn(),
  useRatingAggregate: jest.fn(),
}));

jest.mock('@/features/reviews/hooks/useReviewMutations', () => ({
  useCreateReviewMutation: jest.fn(),
  useUpdateReviewMutation: jest.fn(),
  useDeleteReviewMutation: jest.fn(),
}));

jest.mock('@/features/details/movie/hooks/useMovieDetails', () => ({
  useMovieDetails: jest.fn(() => ({ data: null, isLoading: false })),
}));

jest.mock('@/features/details/tv/hooks/useTvShowDetails', () => ({
  useTvShowDetails: jest.fn(() => ({ data: null, isLoading: false })),
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
      items: [otherReview],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      reviewScoreDistribution: { '8': 2, '3': 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: mockRefetch,
    ...overrides,
  };
}

describe('ReviewsDetailContent', () => {
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
    (useMyRating as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: {
        averageScore: 8,
        ratingCount: 3,
        scoreDistribution: { '8': 2, '3': 1 },
      },
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

  it('renders the write-review CTA when the user has not reviewed yet', () => {
    render(
      <ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Interstellar" />,
    );

    expect(screen.getByTestId('reviews-write-section')).toBeTruthy();
    expect(screen.getByLabelText('Write a review')).toBeTruthy();
  });

  it('renders review count and public reviews', () => {
    render(
      <ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Interstellar" />,
    );

    expect(screen.getByText('Reviews')).toBeTruthy();
    expect(screen.getByTestId('reviews-content-title')).toHaveTextContent('Interstellar');
    expect(screen.queryByTestId('reviews-header-rating')).toBeNull();
    expect(screen.getByTestId('reviews-review-count')).toHaveTextContent('1 review');
    expect(screen.getByTestId('reviews-community-rating')).toHaveTextContent(/4\.0/);
    expect(screen.getByTestId('reviews-community-rating')).toHaveTextContent(/3 ratings/);
    expect(screen.getByTestId('reviews-rating-distribution')).toBeTruthy();
    expect(screen.getByTestId('reviews-rating-histogram')).toBeTruthy();
    expect(screen.getByTestId('reviews-feed-header')).toBeTruthy();
    expect(screen.getByText('Alex Smith')).toBeTruthy();
    expect(screen.getByText('Solid watch.')).toBeTruthy();
  });

  it('shows loading instead of empty state during the initial fetch', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: undefined,
        isLoading: true,
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    expect(screen.getByTestId('reviews-loading')).toBeTruthy();
    expect(screen.queryByTestId('reviews-empty-state')).toBeNull();
  });

  it('shows empty state when there are no reviews', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);
    expect(screen.getByTestId('reviews-empty-state')).toBeTruthy();
    expect(screen.getByText('No reviews yet')).toBeTruthy();
    expect(screen.getByText('No one has shared their thoughts on this title yet.')).toBeTruthy();
    expect(screen.getByTestId('reviews-empty-state-action')).toBeTruthy();
    expect(screen.queryByTestId('reviews-write-section')).toBeNull();
    expect(screen.queryByTestId('reviews-sort-control')).toBeNull();
  });

  it('shows error with retry', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: undefined,
        isError: true,
        error: new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }),
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);
    expect(screen.getByText('Server error.')).toBeTruthy();
    expect(screen.queryByTestId('reviews-empty-state')).toBeNull();
    fireEvent.press(screen.getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('prompts login when writing a review while logged out', () => {
    mockRequireAuth.mockReturnValue(false);

    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);
    fireEvent.press(screen.getByTestId('reviews-empty-state-action'));

    expect(mockCreateMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Please sign in to write a review.')).toBeTruthy();
  });

  it('opens composer and submits a new review', async () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    fireEvent.press(screen.getByTestId('reviews-empty-state-action'));
    expect(screen.getByTestId('review-composer-anchor')).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText('Review'), 'Great film.');
    fireEvent.press(screen.getByText('Post review'));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { content: 'Great film.' },
      expect.any(Object),
    );
  });

  it('expands a long own review preview inline', () => {
    const longReview = {
      ...myReview,
      content: 'A'.repeat(120),
    };

    (useMyReview as jest.Mock).mockReturnValue({
      data: longReview,
      isLoading: false,
    });

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    expect(screen.getByText('Read more')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Read more of your review'));
    expect(screen.getByText('Show less')).toBeTruthy();
    expect(screen.getByText(longReview.content)).toBeTruthy();
  });

  it('shows own review in header bar instead of pinning it in the list', () => {
    (useMyReview as jest.Mock).mockReturnValue({
      data: myReview,
      isLoading: false,
    });

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    expect(screen.getByTestId('reviews-own-review-bar')).toBeTruthy();
    expect(screen.getByText('Your review')).toBeTruthy();
    expect(screen.getByText('My take on this title.')).toBeTruthy();
    expect(screen.getByLabelText('Edit review')).toBeTruthy();
    expect(screen.queryByText('Jane Doe')).toBeNull();
    expect(screen.queryByText('You')).toBeNull();
    expect(screen.queryByText('Write')).toBeNull();
    expect(screen.getByText('Alex Smith')).toBeTruthy();
  });

  it('edits own review', () => {
    (useMyReview as jest.Mock).mockReturnValue({
      data: myReview,
      isLoading: false,
    });

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    fireEvent.press(screen.getByLabelText('Edit review'));
    expect(screen.getByTestId('review-composer-anchor')).toBeTruthy();
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

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);
    fireEvent.press(screen.getByLabelText('Edit review'));
    fireEvent.press(screen.getByLabelText('Delete review'));

    expect(alertSpy).toHaveBeenCalled();
    expect(mockDeleteMutate).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('shows pagination controls when multiple pages are available', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [otherReview],
          page: 1,
          pageSize: 10,
          totalCount: 12,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);
    expect(screen.getByTestId('reviews-pagination-label')).toHaveTextContent('1 / 2');
  });

  it('renders author rating when present on a review', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [{ ...otherReview, userRating: 8 }],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);
    expect(screen.getByLabelText('Rated 4.0 out of 5 stars')).toBeTruthy();
  });

  it('shows half-star author ratings on review cards', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [{ ...otherReview, userRating: 7 }],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);
    expect(screen.getByLabelText('Rated 3.5 out of 5 stars')).toBeTruthy();
  });

  it('does not show community histogram when there are no community ratings', () => {
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: {
        averageScore: 0,
        ratingCount: 0,
        scoreDistribution: {},
      },
      isLoading: false,
    });
    (useMyRating as jest.Mock).mockReturnValue({
      data: { score: 8 },
      isLoading: false,
    });
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(
      <ReviewsDetailContent
        contentType="movie"
        contentId={movieId}
        contentTitle="Inception"
      />,
    );

    expect(screen.queryByTestId('reviews-rating-distribution')).toBeNull();
    expect(screen.queryByTestId('reviews-sort-control')).toBeNull();
    expect(screen.queryByTestId('reviews-header-rating')).toBeNull();
    expect(screen.getByText('No reviews yet')).toBeTruthy();
  });

  it('hides community histogram when there are no community ratings', () => {
    (useMyReview as jest.Mock).mockReturnValue({
      data: { ...myReview, userRating: 8 },
      isLoading: false,
    });
    (useMyRating as jest.Mock).mockReturnValue({
      data: { score: 8 },
      isLoading: false,
    });
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: {
        averageScore: 0,
        ratingCount: 0,
        scoreDistribution: {},
      },
      isLoading: false,
    });
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('reviews-rating-distribution')).toBeNull();
    expect(screen.queryByTestId('reviews-sort-control')).toBeNull();
    expect(screen.queryByTestId('reviews-empty-state')).toBeNull();
    expect(screen.getByTestId('reviews-own-review-bar')).toBeTruthy();
  });

  it('replaces the empty state with the own review bar after posting the first review', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    const { rerender } = render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    expect(screen.getByTestId('reviews-empty-state')).toBeTruthy();

    (useMyReview as jest.Mock).mockReturnValue({
      data: myReview,
      isLoading: false,
    });

    rerender(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('reviews-empty-state')).toBeNull();
    expect(screen.getByTestId('reviews-own-review-bar')).toBeTruthy();
  });

  it('does not flash community distribution when only the current user has rated', () => {
    (useMyReview as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    (useMyRating as jest.Mock).mockReturnValue({
      data: { score: 8 },
      isLoading: false,
    });
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: {
        averageScore: 8,
        ratingCount: 1,
        scoreDistribution: { '8': 1 },
      },
      isLoading: false,
    });
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [myReview],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('reviews-rating-distribution')).toBeNull();
    expect(screen.queryByTestId('reviews-sort-control')).toBeNull();
  });

  it('hides community controls when only the current user has a review', () => {
    (useMyReview as jest.Mock).mockReturnValue({
      data: myReview,
      isLoading: false,
    });
    (useMovieReviews as jest.Mock).mockReturnValue(
      mockReviewsQuery({
        data: {
          items: [myReview],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    expect(screen.getByTestId('reviews-own-review-bar')).toBeTruthy();
    expect(screen.queryByTestId('reviews-sort-control')).toBeNull();
    expect(screen.queryByTestId('reviews-rating-distribution')).toBeNull();
  });

  it('explains when a rating filter only matches the current user review', () => {
    (useMyReview as jest.Mock).mockReturnValue({
      data: { ...myReview, userRating: 8 },
      isLoading: false,
    });
    (useMyRating as jest.Mock).mockReturnValue({
      data: { score: 8 },
      isLoading: false,
    });
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: {
        averageScore: 8,
        ratingCount: 2,
        scoreDistribution: { '8': 2 },
      },
      isLoading: false,
    });
    (useMovieReviews as jest.Mock).mockImplementation((_id, options) =>
      mockReviewsQuery({
        data: {
          items: options?.ratingStars === 4 ? [{ ...myReview, userRating: 8 }] : [otherReview],
          page: 1,
          pageSize: 10,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          reviewScoreDistribution: { '8': 1 },
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    fireEvent.press(screen.getByTestId('reviews-rating-bar-4'));
    expect(screen.getByText('Your review matches this rating. See it above.')).toBeTruthy();
  });

  it('does not present a ratings-only star bucket as a filterable review bucket', () => {
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: {
        averageScore: 4,
        ratingCount: 12,
        scoreDistribution: { '3': 10, '4': 1, '8': 1 },
      },
      isLoading: false,
    });
    (useMovieReviews as jest.Mock).mockImplementation((_id, options) =>
      mockReviewsQuery({
        data: {
          items: options?.ratingStars === 2 ? [] : [otherReview],
          page: 1,
          pageSize: 10,
          totalCount: options?.ratingStars === 2 ? 0 : 1,
          totalPages: options?.ratingStars === 2 ? 0 : 1,
          hasNextPage: false,
          hasPreviousPage: false,
          reviewScoreDistribution: { '8': 1 },
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    const twoStarBar = screen.getByTestId('reviews-rating-bar-2');
    expect(twoStarBar.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(twoStarBar);
    expect(screen.queryByText('No 2-star reviews yet.')).toBeNull();
    expect(useMovieReviews).not.toHaveBeenCalledWith(
      movieId,
      expect.objectContaining({ ratingStars: 2 }),
    );
  });

  it('filters written reviews when a populated histogram bucket is tapped', () => {
    (useMovieReviews as jest.Mock).mockImplementation((_id, options) =>
      mockReviewsQuery({
        data: {
          items:
            options?.ratingStars === 4
              ? [{ ...otherReview, id: 'four-star-review', userRating: 8 }]
              : [otherReview],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          reviewScoreDistribution: { '8': 1, '3': 0 },
        },
      }),
    );

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} />);

    fireEvent.press(screen.getByTestId('reviews-rating-bar-4'));
    expect(useMovieReviews).toHaveBeenCalledWith(
      movieId,
      expect.objectContaining({ ratingStars: 4 }),
    );
    expect(screen.getByText('4★ filter')).toBeTruthy();
    expect(screen.queryByText('No 4-star reviews yet.')).toBeNull();
  });

  it('uses tv review query for tv content', () => {
    render(<ReviewsDetailContent contentType="tv" contentId={movieId} />);
    expect(useTvShowReviews).toHaveBeenCalledWith(movieId, {
      page: 1,
      sort: 'newest',
      ratingStars: null,
    });
  });
});
