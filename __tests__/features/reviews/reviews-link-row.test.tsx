import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReviewsLinkRow } from '@/features/reviews/components/ReviewsLinkRow';
import { useMovieReviews } from '@/features/reviews/hooks/useMovieReviews';
import { useTvShowReviews } from '@/features/reviews/hooks/useTvShowReviews';
import { REVIEW_COUNT_PAGE_SIZE } from '@/features/reviews/types';
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

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function mockCountQuery(totalCount: number, overrides: Record<string, unknown> = {}) {
  return {
    data: {
      pages: [
        {
          items: totalCount > 0 ? [{ id: 'review-1' }] : [],
          page: 1,
          pageSize: REVIEW_COUNT_PAGE_SIZE,
          totalCount,
          totalPages: totalCount,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
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
        returnHref={`/movie/${movieId}`}
      />,
    );

    expect(screen.getByText('Reviews')).toBeTruthy();
    expect(screen.getByTestId('reviews-count')).toHaveTextContent('121');
    expect(screen.queryByText('(121)')).toBeNull();
    expect(screen.getByLabelText('Reviews, 121 reviews')).toBeTruthy();
  });

  it('renders zero count correctly', () => {
    (useMovieReviews as jest.Mock).mockReturnValue(mockCountQuery(0));

    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
        returnHref={`/movie/${movieId}`}
      />,
    );

    expect(screen.getByTestId('reviews-count')).toHaveTextContent('0');
    expect(screen.queryByText('(0)')).toBeNull();
    expect(screen.getByLabelText('Reviews, 0 reviews')).toBeTruthy();
  });

  it('uses compact navigation row styling instead of an elevated card', () => {
    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
        returnHref={`/movie/${movieId}`}
      />,
    );

    const row = screen.getByTestId('reviews-link-row-button');
    const flattened = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style.filter(Boolean))
      : row.props.style;

    expect(flattened.backgroundColor).toBeUndefined();
    expect(flattened.borderRadius).toBeUndefined();
    expect(flattened.borderWidth).toBeUndefined();
    expect(screen.getByTestId('reviews-count')).toHaveStyle({ color: colors.textSecondary });
  });

  it('uses a lightweight page size for count lookup', () => {
    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
        returnHref={`/movie/${movieId}`}
      />,
    );

    expect(useMovieReviews).toHaveBeenCalledWith(movieId, REVIEW_COUNT_PAGE_SIZE);
  });

  it('opens the movie reviews route with exactly one navigation action when pressed', () => {
    render(
      <ReviewsLinkRow
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
        returnHref={`/movie/${movieId}`}
      />,
    );

    fireEvent.press(screen.getByTestId('reviews-link-row-button'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      `/reviews/movie/${movieId}?title=Interstellar`,
    );
  });

  it('opens the tv reviews route when pressed', () => {
    render(
      <ReviewsLinkRow
        contentType="tv"
        contentId={movieId}
        contentTitle="Breaking Bad"
        returnHref={`/tv/${movieId}`}
      />,
    );

    fireEvent.press(screen.getByTestId('reviews-link-row-button'));

    expect(mockPush).toHaveBeenCalledWith(
      `/reviews/tv/${movieId}?title=Breaking+Bad`,
    );
    expect(useTvShowReviews).toHaveBeenCalledWith(movieId, REVIEW_COUNT_PAGE_SIZE);
  });
});
