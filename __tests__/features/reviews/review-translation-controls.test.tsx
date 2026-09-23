import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewTranslationControls } from '@/features/reviews/components/ReviewTranslationControls';
import * as reviewsApi from '@/features/reviews/api/reviews-api';
import type { ReviewResponse } from '@/features/reviews/types';

jest.mock('@/features/reviews/api/reviews-api');

jest.mock('@/i18n', () => {
  const actual = jest.requireActual<typeof import('@/i18n')>('@/i18n');
  return {
    ...actual,
    getUiFormatLocaleTag: () => 'en-US',
  };
});

jest.mock('@/features/locale/hooks/useLocalePreference', () => ({
  useLocalePreference: () => ({ language: 'en' }),
}));

const review: ReviewResponse = {
  id: 'review-1',
  user: { id: 'user-1', displayName: 'Alex' },
  content: 'Película increíble',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  authoringLocale: 'es-ES',
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('ReviewTranslationControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides translation action when authoring locale matches current locale', () => {
    renderWithClient(
      <ReviewTranslationControls
        review={{ ...review, authoringLocale: 'en-US' }}
      />,
    );

    expect(screen.queryByTestId('review-see-translation')).toBeNull();
    expect(screen.getByText('Película increíble')).toBeTruthy();
  });

  it('requests translation once and toggles back to original', async () => {
    jest.spyOn(reviewsApi, 'translateReview').mockResolvedValue({
      reviewId: review.id,
      outcome: 'Translated',
      translatedText: 'Amazing movie',
      detectedSourceLanguage: 'es',
      targetLocale: 'en-US',
    });

    renderWithClient(<ReviewTranslationControls review={review} />);

    fireEvent.press(screen.getByTestId('review-see-translation'));

    await waitFor(() => {
      expect(screen.getByText('Amazing movie')).toBeTruthy();
    });

    expect(reviewsApi.translateReview).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId('review-see-original'));
    expect(screen.getByText('Película increíble')).toBeTruthy();

    fireEvent.press(screen.getByTestId('review-see-translation'));
    expect(reviewsApi.translateReview).toHaveBeenCalledTimes(1);
  });

  it('shows only retry after a failed translation request', async () => {
    jest.spyOn(reviewsApi, 'translateReview').mockRejectedValue(new Error('network'));

    renderWithClient(<ReviewTranslationControls review={review} />);

    fireEvent.press(screen.getByTestId('review-see-translation'));

    await waitFor(() => {
      expect(screen.getByTestId('review-translation-retry')).toBeTruthy();
    });

    expect(screen.getByText('Película increíble')).toBeTruthy();
    expect(screen.queryByTestId('review-see-translation')).toBeNull();
  });

  it('keeps original text visible while translating', () => {
    jest.spyOn(reviewsApi, 'translateReview').mockImplementation(
      () => new Promise(() => undefined),
    );

    renderWithClient(<ReviewTranslationControls review={review} />);

    fireEvent.press(screen.getByTestId('review-see-translation'));

    expect(screen.getByText('Película increíble')).toBeTruthy();
    expect(screen.getByText('Translating…')).toBeTruthy();
    expect(screen.queryByTestId('review-see-translation')).toBeNull();
  });

  it('keeps original text when source matches target', async () => {
    jest.spyOn(reviewsApi, 'translateReview').mockResolvedValue({
      reviewId: review.id,
      outcome: 'SourceMatchesTarget',
      translatedText: null,
      detectedSourceLanguage: 'en',
      targetLocale: 'en-US',
    });

    renderWithClient(<ReviewTranslationControls review={review} />);

    fireEvent.press(screen.getByTestId('review-see-translation'));

    await waitFor(() => {
      expect(screen.getByText('Película increíble')).toBeTruthy();
    });

    expect(screen.queryByTestId('review-see-translation')).toBeNull();
  });
});
