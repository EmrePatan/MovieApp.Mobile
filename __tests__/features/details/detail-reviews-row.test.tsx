import mockReact from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import { useMovieReviews } from '@/features/reviews/hooks/useMovieReviews';
import { useTvShowReviews } from '@/features/reviews/hooks/useTvShowReviews';
import { REVIEW_COUNT_PAGE_SIZE } from '@/features/reviews/types';
import type { MovieDetailsResponse } from '@/features/details/movie/types';
import type { TvShowDetailsResponse } from '@/features/details/tv/types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSegments: () => ['(tabs)', 'movie', movieId],
}));

jest.mock('@/features/details/videos/components/PlayTrailerButton', () => ({
  PlayTrailerButton: () => null,
}));

jest.mock('@/features/gallery/hooks/useGallery', () => ({
  useMovieGallery: () => ({ data: undefined, isLoading: false }),
  useTvShowGallery: () => ({ data: undefined, isLoading: false }),
}));

jest.mock('@/features/details/shared/components/DetailActionBar', () => ({
  DetailActionBar: () => null,
}));

jest.mock('@/features/ratings/components/DetailInlineRatingSection', () => ({
  DetailInlineRatingSection: () =>
    mockReact.createElement('Text', { testID: 'detail-inline-rating-section' }, 'Rating'),
}));

jest.mock('@/features/reviews/hooks/useMovieReviews', () => ({
  useMovieReviews: jest.fn(),
}));

jest.mock('@/features/reviews/hooks/useTvShowReviews', () => ({
  useTvShowReviews: jest.fn(),
}));

jest.mock('@/features/recommendations/components/SimilarContentSection', () => ({
  SimilarContentSection: () => null,
}));

jest.mock('@/features/details/credits/components/CastRail', () => ({
  CastRail: () => null,
}));

jest.mock('@/features/details/watch-providers/components/WhereToWatchRail', () => ({
  WhereToWatchRail: () => null,
}));

jest.mock('@/features/external-ratings/components/OtherRatingsSection', () => ({
  OtherRatingsSection: () => null,
}));

jest.mock('@/features/gallery/components/CatalogGallerySection', () => ({
  CatalogGallerySection: () => null,
}));

jest.mock('@/features/details/collection/components/CollectionLinkRow', () => ({
  CollectionLinkRow: () => null,
}));

jest.mock('@/features/details/tv/components/SeasonList', () => ({
  SeasonList: () =>
    mockReact.createElement('View', { testID: 'season-list-section' }),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

const releasedMovie: MovieDetailsResponse = {
  id: movieId,
  externalIds: { tmdbId: 1, tvdbId: null, imdbId: null },
  title: 'Interstellar',
  originalTitle: null,
  overview: 'A journey through space.',
  releaseDate: '2014-11-07',
  runtimeMinutes: 169,
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 8.6,
  voteCount: 1000,
  genres: ['Sci-Fi'],
  collection: null,
  canFollowForRelease: false,
  canSetReleaseAlert: false,
  isReleased: true,
};

const show: TvShowDetailsResponse = {
  id: tvShowId,
  externalIds: { tmdbId: 2, tvdbId: null, imdbId: null },
  title: 'Breaking Bad',
  originalTitle: null,
  overview: 'A teacher cooks.',
  firstAirDate: '2008-01-20',
  lastAirDate: null,
  posterPath: null,
  backdropPath: null,
  originalLanguage: 'en',
  voteAverage: 8.9,
  voteCount: 100,
  status: 'Ended',
  genres: ['Drama'],
  seasons: [],
  canFollow: false,
};

function collectTestIds(node: { props?: { testID?: string }; children?: unknown[] }): string[] {
  const ids: string[] = [];

  if (node.props?.testID) {
    ids.push(node.props.testID);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child && typeof child === 'object' && 'props' in child) {
        ids.push(...collectTestIds(child as { props?: { testID?: string }; children?: unknown[] }));
      }
    }
  }

  return ids;
}

function mockCountQuery(totalCount: number) {
  return {
    data: {
      items: [],
      page: 1,
      pageSize: REVIEW_COUNT_PAGE_SIZE,
      totalCount,
      totalPages: totalCount,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
    isError: false,
  };
}

describe('detail reviews row', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMovieReviews as jest.Mock).mockReturnValue(mockCountQuery(121));
    (useTvShowReviews as jest.Mock).mockReturnValue(mockCountQuery(42));
  });

  it('shows the compact reviews row below rating on movie detail', () => {
    render(<MovieDetailContent movie={releasedMovie} />);

    expect(screen.getByTestId('detail-inline-rating-section')).toBeTruthy();
    expect(screen.getByTestId('reviews-link-row')).toBeTruthy();
    expect(screen.getByTestId('reviews-count')).toHaveTextContent('121');
    expect(screen.queryByTestId('reviews-section')).toBeNull();
    expect(screen.queryByTestId('reviews-detail-content')).toBeNull();
    expect(screen.queryByText('Load more reviews')).toBeNull();
  });

  it('shows the reviews section below seasons on tv detail', () => {
    render(<TvShowDetailContent show={show} />);

    expect(screen.getByTestId('detail-inline-rating-section')).toBeTruthy();
    expect(screen.getByTestId('season-list-section')).toBeTruthy();
    expect(screen.getByTestId('reviews-link-row')).toBeTruthy();
    expect(screen.getByTestId('reviews-count')).toHaveTextContent('42');
    expect(screen.queryByTestId('reviews-section')).toBeNull();

    const order = collectTestIds(screen.root);
    expect(order.indexOf('season-list-section')).toBeLessThan(
      order.indexOf('reviews-link-row'),
    );
  });

  it('navigates to the dedicated reviews screen from movie detail', () => {
    render(<MovieDetailContent movie={releasedMovie} />);

    fireEvent.press(screen.getByTestId('reviews-link-row-button'));

    expect(mockPush).toHaveBeenCalledWith(
      `/movie/${movieId}/reviews?title=Interstellar`,
      { withAnchor: true },
    );
  });

  it('navigates to the dedicated reviews screen from tv detail', () => {
    render(<TvShowDetailContent show={show} />);

    fireEvent.press(screen.getByTestId('reviews-link-row-button'));

    expect(mockPush).toHaveBeenCalledWith(
      `/tv/${tvShowId}/reviews?title=Breaking+Bad`,
      { withAnchor: true },
    );
  });

  it('still shows reviews row for unreleased movies without inline rating', () => {
    render(
      <MovieDetailContent
        movie={{
          ...releasedMovie,
          isReleased: false,
          canFollowForRelease: true,
          canSetReleaseAlert: true,
        }}
      />,
    );

    expect(screen.queryByTestId('detail-inline-rating-section')).toBeNull();
    expect(screen.getByTestId('reviews-link-row')).toBeTruthy();
  });
});
