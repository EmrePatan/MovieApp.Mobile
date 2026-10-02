import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReviewsLinkRow } from '@/features/reviews/components/ReviewsLinkRow';
import { useMovieReviews } from '@/features/reviews/hooks/useMovieReviews';
import { useTvShowReviews } from '@/features/reviews/hooks/useTvShowReviews';
import {
  DETAIL_REVIEWS_PREVIEW_PAGE_SIZE,
} from '@/features/reviews/types';
import type { ReviewResponse } from '@/features/reviews/types';
import { colors } from '@/theme/colors';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/features/reviews/hooks/useMovieReviews', () => ({
  useMovieReviews: jest.fn(),
}));

jest.mock('@/features/reviews/hooks/useTvShowReviews', () => ({
  useTvShowReviews: jest.fn(),
}));

jest.mock('@/features/reviews/components/ReviewTranslationControls', () => ({
  ReviewTranslationControls: ({ review }: { review: ReviewResponse }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, review.content);
  },
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createPreviewReview(id: string, title: string): ReviewResponse {
  return {
    id,
    content: `${title} review body`,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    userRating: 8,
    user: {
      id: `user-${id}`,
      displayName: title,
      effectiveAvatarUrl: null,
    },
  };
}

function mockCountQuery(totalCount: number, overrides: Record<string, unknown> = {}) {
  const items =
    totalCount > 0
      ? Array.from({ length: Math.min(totalCount, DETAIL_REVIEWS_PREVIEW_PAGE_SIZE) }, (_, index) =>
          createPreviewReview(`review-${index + 1}`, `Reviewer ${index + 1}`),
        )
      : [];

  return {
    data: {
      items,
      page: 1,
      pageSize: DETAIL_REVIEWS_PREVIEW_PAGE_SIZE,
      totalCount,
      totalPages: totalCount,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

describe('ReviewsLinkRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMovieReviews as jest.Mock).mockReturnValue(mockCountQuery(121));
    (useTvShowReviews as jest.Mock).mockReturnValue(mockCountQuery(8));
  });

  it('renders the real total review count', () => {
    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
      />,
    );

    expect(screen.getByText('Reviews')).toBeTruthy();
    expect(screen.getByTestId('reviews-count')).toHaveTextContent('121');
    expect(screen.queryByText('(121)')).toBeNull();
    expect(screen.getByLabelText('Reviews, 121 reviews')).toBeTruthy();
  });

  it('renders a soft empty label instead of zero count', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(mockCountQuery(0));

    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
      />,
    );

    expect(screen.getByTestId('reviews-empty-label')).toHaveTextContent('No reviews yet');
    expect(screen.queryByTestId('reviews-count')).toBeNull();
    expect(screen.queryByText('0')).toBeNull();
    expect(screen.getByLabelText('Reviews, No reviews yet')).toBeTruthy();
  });

  it('uses section header styling instead of separator rows or elevated cards', () => {
    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
      />,
    );

    const row = screen.getByTestId('reviews-link-row-button');
    const flattened = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style.filter(Boolean))
      : row.props.style;

    expect(flattened.backgroundColor).toBeUndefined();
    expect(flattened.borderRadius).toBeUndefined();
    expect(flattened.borderWidth).toBeUndefined();
    expect(screen.getByTestId('reviews-count')).toHaveStyle({ color: colors.accent });
    expect(screen.queryByTestId('reviews-separator')).toBeNull();
  });

  it('loads up to five reviews for the detail preview rail', () => {
    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
      />,
    );

    expect(useMovieReviews).toHaveBeenCalledWith(movieId, {
      page: 1,
      pageSize: DETAIL_REVIEWS_PREVIEW_PAGE_SIZE,
    });
    expect(screen.getByTestId('reviews-preview-rail')).toBeTruthy();
    expect(screen.getByTestId('review-preview-card-review-1')).toBeTruthy();
    expect(screen.getByText('Reviewer 1 review body')).toBeTruthy();
    expect(screen.queryByTestId('review-preview-card-review-6')).toBeNull();
  });

  it('does not render the preview rail when there are zero reviews', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(mockCountQuery(0));

    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
      />,
    );

    expect(screen.queryByTestId('reviews-preview-rail')).toBeNull();
  });

  it('opens the movie reviews route when a preview card is pressed', () => {
    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
      />,
    );

    fireEvent.press(screen.getByTestId('review-preview-card-review-1'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      `/movie/${movieId}/reviews?title=Interstellar`,
      { withAnchor: true },
    );
  });

  it('opens the movie reviews route with exactly one navigation action when pressed', () => {
    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
      />,
    );

    fireEvent.press(screen.getByTestId('reviews-link-row-button'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      `/movie/${movieId}/reviews?title=Interstellar`,
      { withAnchor: true },
    );
  });

  it('opens the tv reviews route when pressed', () => {
    render(
      <ReviewsLinkRow
        contentType="tv"
        contentId={movieId}
        contentTitle="Breaking Bad"
      />,
    );

    fireEvent.press(screen.getByTestId('reviews-link-row-button'));

    expect(mockPush).toHaveBeenCalledWith(
      `/tv/${movieId}/reviews?title=Breaking+Bad`,
      { withAnchor: true },
    );
    expect(useTvShowReviews).toHaveBeenCalledWith(movieId, {
      page: 1,
      pageSize: DETAIL_REVIEWS_PREVIEW_PAGE_SIZE,
    });
  });
});
