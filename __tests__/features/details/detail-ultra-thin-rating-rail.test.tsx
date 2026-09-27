import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailUltraThinRatingRail } from '@/features/details/shared/components/DetailUltraThinRatingRail';
import { openReviewsDetail } from '@/features/details/shared/navigation/reviews-detail-navigation';

const mockUseRatingAggregate = jest.fn();
const mockUseExternalRatings = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/details/shared/navigation/reviews-detail-navigation', () => ({
  openReviewsDetail: jest.fn(),
}));

jest.mock('@/features/ratings/hooks/useRatings', () => ({
  useRatingAggregate: (...args: unknown[]) => mockUseRatingAggregate(...args),
}));

jest.mock('@/features/external-ratings/hooks/useExternalRatings', () => ({
  useExternalRatings: (...args: unknown[]) => mockUseExternalRatings(...args),
}));

describe('DetailUltraThinRatingRail', () => {
  const contentId = '65de321a-597a-46ec-a499-67ad9e20795e';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRatingAggregate.mockReturnValue({
      data: { averageScore: 8, ratingCount: 1200 },
      isLoading: false,
      isError: false,
    });
    mockUseExternalRatings.mockReturnValue({
      data: {
        ratings: [
          { source: 'imdb', value: 8, scale: 10 },
          { source: 'tmdb', value: 8.1, scale: 10 },
        ],
      },
      isLoading: false,
      isError: false,
    });
  });

  it('renders community and external scores in one row', () => {
    render(<DetailUltraThinRatingRail contentType="movie" contentId={contentId} />);

    expect(screen.getByTestId('detail-ultra-thin-rating-rail')).toBeTruthy();
    expect(screen.getByTestId('detail-rail-community-score')).toBeTruthy();
    expect(screen.getByText('4.0')).toBeTruthy();
    expect(screen.getByText('(1.2K)')).toBeTruthy();
    expect(screen.getByTestId('detail-rail-external-imdb')).toBeTruthy();
    expect(screen.getByText('8.0')).toBeTruthy();
    expect(screen.getByText('8.1')).toBeTruthy();
  });

  it('shows gold star and zero when there are no community ratings', () => {
    mockUseRatingAggregate.mockReturnValue({
      data: { averageScore: 0, ratingCount: 0 },
      isLoading: false,
      isError: false,
    });
    mockUseExternalRatings.mockReturnValue({
      data: { ratings: [] },
      isLoading: false,
      isError: false,
    });

    render(<DetailUltraThinRatingRail contentType="tv" contentId={contentId} />);

    expect(screen.getByTestId('detail-rail-community-zero')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('shows TMDB from catalog vote when external snapshot has no TMDB row', () => {
    mockUseExternalRatings.mockReturnValue({
      data: {
        ratings: [{ source: 'imdb', value: 8, scale: 10 }],
      },
      isLoading: false,
      isError: false,
    });

    render(
      <DetailUltraThinRatingRail
        contentType="movie"
        contentId={contentId}
        catalogTmdbVoteAverage={8.1}
      />,
    );

    expect(screen.getByTestId('detail-rail-external-imdb')).toBeTruthy();
    expect(screen.getByTestId('detail-rail-external-tmdb')).toBeTruthy();
    expect(screen.getByText('8.1')).toBeTruthy();
  });

  it('shows provider brand logos while external ratings are loading', () => {
    mockUseExternalRatings.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(
      <DetailUltraThinRatingRail
        contentType="movie"
        contentId={contentId}
        catalogTmdbVoteAverage={8.1}
      />,
    );

    expect(screen.getByTestId('detail-ultra-thin-rating-rail')).toBeTruthy();
    expect(screen.getByTestId('detail-rail-external-imdb')).toBeTruthy();
    expect(screen.getByTestId('detail-rail-external-tmdb')).toBeTruthy();
    expect(screen.queryByTestId('detail-ultra-thin-rating-rail-loading')).toBeNull();
  });

  it('navigates to reviews when the community score is pressed', () => {
    render(
      <DetailUltraThinRatingRail
        contentType="movie"
        contentId={contentId}
        contentTitle="Interstellar"
      />,
    );

    fireEvent.press(screen.getByTestId('detail-rail-community-button'));

    expect(openReviewsDetail).toHaveBeenCalledWith(
      expect.objectContaining({ push: mockPush }),
      expect.stringContaining('/reviews'),
    );
  });

  it('hides community segment when showCommunityScore is false and no externals exist', () => {
    mockUseExternalRatings.mockReturnValue({
      data: { ratings: [] },
      isLoading: false,
      isError: false,
    });

    render(
      <DetailUltraThinRatingRail
        contentType="movie"
        contentId={contentId}
        showCommunityScore={false}
      />,
    );

    expect(screen.queryByTestId('detail-ultra-thin-rating-rail')).toBeNull();
  });
});
