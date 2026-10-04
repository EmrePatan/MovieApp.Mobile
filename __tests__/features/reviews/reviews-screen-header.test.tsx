import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReviewsScreenHeader } from '@/features/reviews/components/ReviewsScreenHeader';
import { interaction } from '@/theme/interaction';
import { initI18nForTests, t } from '../../i18n/i18n-test-utils';

const mockOpenCatalogDetailFromReviews = jest.fn();

jest.mock('@/features/details/shared/navigation/reviews-detail-navigation', () => ({
  openCatalogDetailFromReviews: (...args: unknown[]) =>
    mockOpenCatalogDetailFromReviews(...args),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSegments: () => ['movie', '3fa85f64-5717-4562-b3fc-2c963f66afa6', 'reviews'],
}));
const tvId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('ReviewsScreenHeader', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await initI18nForTests('en');
  });

  it('aligns the back icon with inset headers on padded screens', () => {
    render(
      <ReviewsScreenHeader
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
        reviewCount={1}
      />,
    );

    const backButton = screen.getByLabelText(t('common.back'));
    expect(backButton).toHaveStyle({
      paddingLeft: 0,
      minHeight: interaction.touchTarget,
      minWidth: interaction.touchTarget,
    });
  });

  it('navigates to movie detail when the header content area is pressed', () => {
    render(
      <ReviewsScreenHeader
        contentType="movie"
        contentId={movieId}
        contentTitle="Interstellar"
        reviewCount={2}
        summary={{ averageScore: 8, ratingCount: 3, reviewCount: 2 }}
      />,
    );

    fireEvent.press(screen.getByTestId('reviews-header-catalog-link'));
    expect(mockOpenCatalogDetailFromReviews).toHaveBeenCalledWith(
      expect.anything(),
      'movie',
      movieId,
    );
  });

  it('navigates to tv detail when the header content area is pressed', () => {
    render(
      <ReviewsScreenHeader
        contentType="tv"
        contentId={tvId}
        contentTitle="Breaking Bad"
        reviewCount={1}
      />,
    );

    fireEvent.press(screen.getByLabelText(t('common.openTitle', { title: 'Breaking Bad' })));
    expect(mockOpenCatalogDetailFromReviews).toHaveBeenCalledWith(
      expect.anything(),
      'tv',
      tvId,
    );
  });
});
