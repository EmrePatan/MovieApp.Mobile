import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DetailPersonalRatingProvider,
  DetailPersonalRatingRow,
  useOptionalDetailPersonalRating,
} from '@/features/details/shared/components/DetailPersonalRatingExperience';

const mockUseMyRating = jest.fn();
const mockUseMovieWatchStatus = jest.fn();
const mockUseTvShowProgress = jest.fn();

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

jest.mock('@/features/ratings/hooks/useRatings', () => ({
  useMyRating: (...args: unknown[]) => mockUseMyRating(...args),
}));

jest.mock('@/features/watch-history/hooks/useMovieWatchStatus', () => ({
  useMovieWatchStatus: (...args: unknown[]) => mockUseMovieWatchStatus(...args),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: (...args: unknown[]) => mockUseTvShowProgress(...args),
}));

jest.mock('@/features/ratings/hooks/useRatingMutations', () => ({
  useRateContent: () => ({ mutate: jest.fn(), isPending: false }),
  useDeleteRating: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

describe('DetailPersonalRatingRow', () => {
  const contentId = '65de321a-597a-46ec-a499-67ad9e20795e';

  function renderRow(ui: React.ReactElement) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMovieWatchStatus.mockReturnValue({
      data: { isWatched: false },
      isLoading: false,
    });
    mockUseTvShowProgress.mockReturnValue({ data: null, isLoading: false });
    mockUseMyRating.mockReturnValue({ data: null, isLoading: false });
  });

  it('shows nothing when content is not watched', () => {
    renderRow(
      <DetailPersonalRatingProvider contentType="movie" contentId={contentId} watchEligible>
        <DetailPersonalRatingRow contentType="movie" contentId={contentId} watchEligible />
      </DetailPersonalRatingProvider>,
    );

    expect(screen.queryByTestId('detail-personal-rating-rate-cta')).toBeNull();
    expect(screen.queryByTestId('detail-personal-rating-summary')).toBeNull();
  });

  it('shows rate CTA when watched without a personal rating', () => {
    mockUseMovieWatchStatus.mockReturnValue({
      data: { isWatched: true },
      isLoading: false,
    });

    renderRow(
      <DetailPersonalRatingProvider contentType="movie" contentId={contentId} watchEligible>
        <DetailPersonalRatingRow contentType="movie" contentId={contentId} watchEligible />
      </DetailPersonalRatingProvider>,
    );

    expect(screen.getByTestId('detail-personal-rating-rate-cta')).toBeTruthy();
  });

  it('shows compact personal rating summary when watched and rated', () => {
    mockUseMovieWatchStatus.mockReturnValue({
      data: { isWatched: true },
      isLoading: false,
    });
    mockUseMyRating.mockReturnValue({
      data: { score: 8 },
      isLoading: false,
    });

    renderRow(
      <DetailPersonalRatingProvider contentType="movie" contentId={contentId} watchEligible>
        <DetailPersonalRatingRow contentType="movie" contentId={contentId} watchEligible />
      </DetailPersonalRatingProvider>,
    );

    expect(screen.getByTestId('detail-personal-rating-summary')).toBeTruthy();
    expect(screen.getByText('4/5')).toBeTruthy();
  });

  it('opens the rating sheet with the existing score when editing', () => {
    mockUseMovieWatchStatus.mockReturnValue({
      data: { isWatched: true },
      isLoading: false,
    });
    mockUseMyRating.mockReturnValue({
      data: { score: 6 },
      isLoading: false,
    });

    renderRow(
      <DetailPersonalRatingProvider contentType="movie" contentId={contentId} watchEligible>
        <DetailPersonalRatingRow contentType="movie" contentId={contentId} watchEligible />
      </DetailPersonalRatingProvider>,
    );

    fireEvent.press(screen.getByTestId('detail-personal-rating-summary'));
    expect(screen.getByTestId('personal-rating-prompt-sheet')).toBeTruthy();
    expect(screen.getByTestId('whole-star-3')).toBeTruthy();
  });

  it('opens optional rating prompt after watched transition', () => {
    function WatchedProbe() {
      const personalRating = useOptionalDetailPersonalRating();
      return (
        <Pressable
          testID="watched-probe"
          onPress={() => personalRating?.handleMarkedWatched()}
        >
          <Text>Mark</Text>
        </Pressable>
      );
    }

    renderRow(
      <DetailPersonalRatingProvider contentType="movie" contentId={contentId} watchEligible>
        <WatchedProbe />
      </DetailPersonalRatingProvider>,
    );

    fireEvent.press(screen.getByTestId('watched-probe'));
    expect(screen.getByTestId('personal-rating-prompt-sheet')).toBeTruthy();
  });
});
