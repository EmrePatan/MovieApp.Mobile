import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FollowingSection } from '@/features/following/components/FollowingSection';
import { useFollowingCatalog } from '@/features/following/hooks/useFollowingCatalog';
import * as dateUtils from '@/utils/date';

const movieItem = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  type: 'movie' as const,
  title: 'Dune: Part Three',
  posterUrl: 'https://example.com/dune.jpg',
  releaseDate: '2026-12-18',
  year: 2026,
};

const tvItem = {
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  type: 'tv' as const,
  title: 'Severance',
  posterUrl: 'https://example.com/severance.jpg',
  releaseDate: null,
  year: 2022,
};

jest.mock('@/features/following/hooks/useFollowingCatalog', () => ({
  useFollowingCatalog: jest.fn(),
}));

describe('FollowingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(dateUtils, 'isFutureReleaseDate').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders movie and tv items', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [movieItem, tvItem] }] },
      isLoading: false,
      isError: false,
    });

    render(<FollowingSection />);

    expect(screen.getByText('Following')).toBeTruthy();
    expect(screen.getByText('Dune: Part Three')).toBeTruthy();
    expect(screen.getByText('Severance')).toBeTruthy();
    expect(screen.getByText(/Coming /)).toBeTruthy();
  });

  it('shows empty state when there are no follows', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [] }] },
      isLoading: false,
      isError: false,
    });

    render(<FollowingSection />);

    expect(screen.getByText('Nothing followed yet')).toBeTruthy();
    expect(
      screen.getByText('Tap Notify on upcoming movies or Follow TV shows to track releases here.'),
    ).toBeTruthy();
  });

  it('calls onItemPress with the tapped item', () => {
    const onItemPress = jest.fn();
    (useFollowingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [movieItem, tvItem] }] },
      isLoading: false,
      isError: false,
    });

    render(<FollowingSection onItemPress={onItemPress} />);
    fireEvent.press(screen.getByRole('button', { name: /Dune: Part Three/ }));

    expect(onItemPress).toHaveBeenCalledWith(movieItem);
  });
});
