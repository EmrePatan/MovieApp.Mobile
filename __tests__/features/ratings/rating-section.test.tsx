import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { DetailInlineRatingSection } from '@/features/ratings/components/DetailInlineRatingSection';
import { StarRatingSelector } from '@/features/ratings/components/StarRatingSelector';
import { useMyRating, useRatingAggregate } from '@/features/ratings/hooks/useRatings';
import { useDeleteRating, useRateContent } from '@/features/ratings/hooks/useRatingMutations';

const mockMutate = jest.fn();
const mockDeleteMutate = jest.fn();
const mockRequireAuth = jest.fn(() => true);
jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/ratings/hooks/useRatings', () => ({
  useMyRating: jest.fn(),
  useRatingAggregate: jest.fn(),
}));

jest.mock('@/features/ratings/hooks/useRatingMutations', () => ({
  useRateContent: jest.fn(),
  useDeleteRating: jest.fn(),
}));

function setupRatingMocks({
  score = null as number | null,
  isRatePending = false,
  isDeletePending = false,
}: {
  score?: number | null;
  isRatePending?: boolean;
  isDeletePending?: boolean;
} = {}) {
  (useMyRating as jest.Mock).mockReturnValue({
    data: score != null ? { score } : null,
    isLoading: false,
  });
  (useRatingAggregate as jest.Mock).mockReturnValue({
    data: { averageScore: 7.5, ratingCount: 42, scoreDistribution: {} },
    isLoading: false,
    isError: false,
  });
  (useRateContent as jest.Mock).mockReturnValue({
    mutate: mockMutate,
    isPending: isRatePending,
  });
  (useDeleteRating as jest.Mock).mockReturnValue({
    mutate: mockDeleteMutate,
    isPending: isDeletePending,
  });
}

describe('DetailInlineRatingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);
    setupRatingMocks();
  });

  it('renders unrated with five empty stars and no tap hint', () => {
    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.getByText('Your Rating')).toBeTruthy();
    expect(screen.queryByText('Tap to rate')).toBeNull();
    expect(screen.getByTestId('star-1-empty')).toBeTruthy();
    expect(screen.getByTestId('star-5-empty')).toBeTruthy();
    expect(within(screen.getByTestId('star-rating-selector')).queryByText(/\/ 5/)).toBeNull();
    expect(screen.queryByText(/\/10/)).toBeNull();
  });

  it('keeps the section title left aligned and centers the star row with compact spacing', () => {
    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    const section = screen.getByTestId('detail-inline-rating-section');
    const title = screen.getByText('Your Rating');
    const ratingRow = screen.getByTestId('star-rating-row');

    expect(section).toContainElement(title);
    expect(ratingRow).toHaveStyle({ alignItems: 'center', width: '100%' });
    expect(ratingRow).toContainElement(screen.getByTestId('star-rating-selector'));
    expect(section).toHaveStyle({ marginTop: 8 });
  });

  it('renders backend score 7 as 3 full + 1 half + 1 empty', () => {
    setupRatingMocks({ score: 7 });

    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.getByTestId('star-3-full')).toBeTruthy();
    expect(screen.getByTestId('star-4-half')).toBeTruthy();
    expect(screen.getByTestId('star-5-empty')).toBeTruthy();
  });

  it('renders backend score 9 as 4 full + 1 half', () => {
    setupRatingMocks({ score: 9 });

    render(<DetailInlineRatingSection contentType="tv" contentId="tv-id" />);

    expect(screen.getByTestId('star-4-full')).toBeTruthy();
    expect(screen.getByTestId('star-5-half')).toBeTruthy();
  });

  it('announces the current rating on a 5-star scale', () => {
    setupRatingMocks({ score: 7 });

    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.getByLabelText('Your rating')).toHaveAccessibilityValue({
      text: '3.5 out of 5 stars',
    });
  });

  it('does not show a save button or rating modal', () => {
    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);
    expect(screen.queryByText('Save Rating')).toBeNull();
    expect(screen.queryByText('Cancel')).toBeNull();
    expect(screen.queryByText('Rate this title')).toBeNull();
  });

  it('does not show a separate remove rating control', () => {
    setupRatingMocks({ score: 6 });

    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.queryByText('Reset')).toBeNull();
    expect(screen.queryByText('Clear rating')).toBeNull();
    expect(screen.queryByLabelText('Remove rating')).toBeNull();
  });

  it('shows community rating as subtle secondary metadata', () => {
    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.getByTestId('community-rating-row')).toBeTruthy();
    expect(screen.getByText('Community')).toBeTruthy();
    expect(screen.getByText('★ 3.7 / 5')).toBeTruthy();
    expect(screen.getByText('42 ratings')).toBeTruthy();
  });

  it('uses singular community rating copy for one vote', () => {
    (useRatingAggregate as jest.Mock).mockReturnValue({
      data: { averageScore: 4.5, ratingCount: 1, scoreDistribution: {} },
      isLoading: false,
      isError: false,
    });

    render(<DetailInlineRatingSection contentType="movie" contentId="movie-id" />);

    expect(screen.getByText('1 rating')).toBeTruthy();
  });
});

describe('StarRatingSelector', () => {
  it('renders exactly five visual stars without a numeric label', () => {
    render(<StarRatingSelector value={null} onCommit={jest.fn()} onClear={jest.fn()} />);
    expect(screen.getByTestId('star-rating-selector')).toBeTruthy();
    expect(screen.getByTestId('star-1-empty')).toBeTruthy();
    expect(screen.getByTestId('star-5-empty')).toBeTruthy();
    expect(screen.queryByText('Tap to rate')).toBeNull();
    expect(screen.queryByText(/\/ 5$/)).toBeNull();
  });

  it('supports accessibility increment in 0.5 steps', () => {
    const onCommit = jest.fn();
    render(<StarRatingSelector value={3} onCommit={onCommit} onClear={jest.fn()} />);

    fireEvent(screen.getByLabelText('Your rating'), 'onAccessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(onCommit).toHaveBeenCalledWith(3.5);
  });

  it('supports accessibility decrement in 0.5 steps', () => {
    const onCommit = jest.fn();
    render(<StarRatingSelector value={3} onCommit={onCommit} onClear={jest.fn()} />);

    fireEvent(screen.getByLabelText('Your rating'), 'onAccessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });

    expect(onCommit).toHaveBeenCalledWith(2.5);
  });
});
