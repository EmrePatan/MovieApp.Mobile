import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { usePickSomething } from '@/features/discovery/hooks/usePickSomething';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import PickSomethingScreen from '../../../app/pick-something';

const mockPush = jest.fn();
const mockOpenCatalogDetailFromTab = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useSegments: jest.fn(() => []),
}));

jest.mock('@/features/discovery/hooks/usePickSomething', () => ({
  usePickSomething: jest.fn(),
}));

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

jest.mock('@/features/details/shared/navigation/open-catalog-detail-from-tab', () => ({
  openCatalogDetailFromTab: (...args: unknown[]) => mockOpenCatalogDetailFromTab(...args),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));

const pickItem = {
  id: 'movie-1',
  type: 'movie' as const,
  title: 'Inception',
  originalTitle: 'Inception',
  overview: 'A mind-bending thriller',
  posterUrl: '/poster.jpg',
  backdropUrl: '/backdrop.jpg',
  releaseDate: '2010-07-16',
  voteAverage: 8.8,
  voteCount: 1000,
  year: 2010,
  score: 0.9,
  reason: 'Trending right now',
};

describe('PickSomethingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePickSomething as jest.Mock).mockReturnValue({
      data: { item: pickItem },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('renders the first successful pick with backdrop hero composition', () => {
    render(<PickSomethingScreen />);

    expect(screen.getByTestId('pick-something-hero-backdrop')).toBeTruthy();
    expect(screen.queryByTestId('pick-something-hero-poster-cover')).toBeNull();
    expect(screen.queryByTestId('pick-something-hero-placeholder')).toBeNull();
    expect(screen.getByLabelText('Inception backdrop')).toBeTruthy();
    expect(screen.queryByLabelText('Inception poster')).toBeNull();
    expect(screen.getByText('Inception')).toBeTruthy();
    expect(screen.getByText('Trending right now')).toBeTruthy();
    expect(screen.getByText('Try Another')).toBeTruthy();
    expect(screen.getByText('View Details')).toBeTruthy();
  });

  it('uses full-bleed poster cover when backdrop is missing', () => {
    (usePickSomething as jest.Mock).mockReturnValue({
      data: {
        item: {
          ...pickItem,
          backdropUrl: null,
          posterUrl: 'https://example.com/poster.jpg',
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<PickSomethingScreen />);

    expect(screen.getByTestId('pick-something-hero-poster-cover')).toBeTruthy();
    expect(screen.queryByTestId('pick-something-hero-backdrop')).toBeNull();
    expect(screen.queryByTestId('pick-something-hero-placeholder')).toBeNull();
    expect(screen.getByLabelText('Inception poster')).toBeTruthy();
  });

  it('uses themed placeholder when backdrop and poster are missing', () => {
    (usePickSomething as jest.Mock).mockReturnValue({
      data: {
        item: {
          ...pickItem,
          backdropUrl: null,
          posterUrl: null,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<PickSomethingScreen />);

    expect(screen.getByTestId('pick-something-hero-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('pick-something-hero-backdrop')).toBeNull();
    expect(screen.queryByTestId('pick-something-hero-poster-cover')).toBeNull();
    expect(screen.queryByLabelText('Inception poster')).toBeNull();
  });

  it('tracks pick_something_used exactly once per screen visit', async () => {
    const { rerender } = render(<PickSomethingScreen />);

    await waitFor(() => {
      expect(trackProductMetric).toHaveBeenCalledTimes(1);
      expect(trackProductMetric).toHaveBeenCalledWith('pick_something_used');
    });

    rerender(<PickSomethingScreen />);

    expect(trackProductMetric).toHaveBeenCalledTimes(1);
  });

  it('requests another pick with session exclusions when Try Another is pressed', () => {
    render(<PickSomethingScreen />);

    fireEvent.press(screen.getByText('Try Another'));

    expect(usePickSomething).toHaveBeenLastCalledWith('all', ['movie-1']);
  });

  it('opens catalog detail from View Details', () => {
    render(<PickSomethingScreen />);

    fireEvent.press(screen.getByText('View Details'));

    expect(mockOpenCatalogDetailFromTab).toHaveBeenCalledWith(
      expect.anything(),
      'movie-1',
      'movie',
      'discover',
      expect.objectContaining({ libraryReturnHref: '/pick-something' }),
    );
  });

  it('changes media type and clears session exclusions', () => {
    render(<PickSomethingScreen />);

    fireEvent.press(screen.getByText('Try Another'));
    fireEvent.press(screen.getByLabelText('TV'));

    expect(usePickSomething).toHaveBeenLastCalledWith('tv', []);
  });

  it('renders loading state while fetching', () => {
    (usePickSomething as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: jest.fn(),
    });

    render(<PickSomethingScreen />);

    expect(screen.getByText('Finding something for you...')).toBeTruthy();
  });

  it('renders empty state when no pick is available', () => {
    (usePickSomething as jest.Mock).mockReturnValue({
      data: { item: null },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<PickSomethingScreen />);

    expect(screen.getByText('Nothing to pick right now')).toBeTruthy();
  });

  it('renders error state with retry', () => {
    const refetch = jest.fn();
    (usePickSomething as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: new ApiError('server', 'Unable to pick something right now.', 500),
      refetch,
    });

    render(<PickSomethingScreen />);

    fireEvent.press(screen.getByText('Try Again'));

    expect(refetch).toHaveBeenCalled();
  });
});
