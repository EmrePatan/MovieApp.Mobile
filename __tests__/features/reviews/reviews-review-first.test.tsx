import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
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
import { initI18nForTests, t } from '../../i18n/i18n-test-utils';
import type { ReviewResponse } from '@/features/reviews/types';

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

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: () => true,
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
  useCreateReviewMutation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  useUpdateReviewMutation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  useDeleteReviewMutation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
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
  userRating: 8,
};

function mockReviewsQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      items: [otherReview],
      page: 1,
      pageSize: 10,
      totalCount: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      reviewScoreDistribution: { '8': 2, '3': 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('Reviews feed-first architecture', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await initI18nForTests('en');

    (useAuth as jest.Mock).mockReturnValue({ user: { id: userId } });
    (useMovieReviews as jest.Mock).mockReturnValue(mockReviewsQuery());
    (useTvShowReviews as jest.Mock).mockReturnValue(mockReviewsQuery());
    (useMyReview as jest.Mock).mockReturnValue({ data: myReview, isLoading: false });
    (useMyRating as jest.Mock).mockReturnValue({ data: { score: 8 }, isLoading: false });
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: {
        averageScore: 8,
        ratingCount: 3,
        scoreDistribution: { '8': 2, '3': 1 },
      },
      isLoading: false,
    });
  });

  it('renders compact header metadata on one line', () => {
    render(
      <ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Game of Thrones" />,
    );

    expect(screen.getByTestId('reviews-content-title')).toHaveTextContent('Game of Thrones');
    expect(screen.getByTestId('reviews-header-summary')).toHaveTextContent(/2 reviews/);
  });

  it('shows the rating histogram immediately without a distribution toggle', () => {
    render(<ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Interstellar" />);

    expect(screen.getByTestId('reviews-community-rating')).toHaveTextContent(/4\.0/);
    expect(screen.getByTestId('reviews-rating-histogram')).toBeTruthy();
    expect(screen.getByTestId('reviews-rating-bar-5')).toBeTruthy();
    expect(screen.queryByTestId('reviews-distribution-toggle')).toBeNull();
  });

  it('preserves star filtering and clear-filter behavior', () => {
    render(<ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Interstellar" />);

    fireEvent.press(screen.getByTestId('reviews-rating-bar-4'));
    expect(screen.getByTestId('reviews-filter-star-chip')).toBeTruthy();

    fireEvent.press(screen.getByTestId('reviews-filter-star-chip'));
    expect(screen.queryByTestId('reviews-filter-star-chip')).toBeNull();
  });

  it('renders a compact own-review row with rating and edit action', () => {
    render(<ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Interstellar" />);

    const ownReviewBar = screen.getByTestId('reviews-own-review-bar');
    expect(ownReviewBar).toBeTruthy();
    expect(screen.getByText(t('reviews.yourReview'))).toBeTruthy();
    expect(ownReviewBar).toHaveTextContent(/4\.0/);
    expect(screen.getByLabelText(t('reviews.editReview'))).toBeTruthy();
  });

  it('renders watchlist-style filter and sort chips in the feed header', () => {
    render(<ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Interstellar" />);

    expect(screen.getByTestId('reviews-feed-header')).toBeTruthy();
    expect(screen.getByTestId('reviews-sort-icon')).toBeTruthy();
    expect(screen.getByTestId('reviews-sort-chip-newest')).toBeTruthy();
    expect(screen.getByTestId('reviews-sort-chip-ratingDesc')).toBeTruthy();
  });

  it('changes sort from inline chips', () => {
    render(<ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Interstellar" />);

    fireEvent.press(screen.getByTestId('reviews-sort-chip-oldest'));
    expect(screen.getByTestId('reviews-sort-chip-oldest')).toBeTruthy();
  });

  it('uses Turkish labels for feed-first controls', async () => {
    await initI18nForTests('tr');

    render(<ReviewsDetailContent contentType="movie" contentId={movieId} contentTitle="Interstellar" />);

    expect(screen.getByTestId('reviews-sort-icon')).toBeTruthy();
    expect(screen.getByTestId('reviews-sort-chip-newest')).toHaveTextContent(
      t('reviews.sort.newest'),
    );
    expect(screen.getByTestId('reviews-rating-histogram')).toBeTruthy();
  });
});
