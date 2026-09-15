import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { UpcomingSection } from '@/features/upcoming/components/UpcomingSection';
import { useUpcomingCatalog } from '@/features/upcoming/hooks/useUpcomingCatalog';

const upcomingItem = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  type: 'movie' as const,
  upcomingKind: 'MovieRelease' as const,
  title: 'Avatar 4',
  originalTitle: 'Avatar 4',
  overview: 'The next chapter.',
  posterUrl: 'https://example.com/avatar.jpg',
  backdropUrl: null,
  releaseDate: '2026-12-19',
  voteAverage: 0,
  voteCount: 0,
  year: 2026,
  isFollowed: true,
};

const upcomingItemUnfollowed = {
  ...upcomingItem,
  id: '8fa85f64-5717-4562-b3fc-2c963f66afa7',
  title: 'Mission: Impossible 9',
  isFollowed: false,
};

jest.mock('@/features/upcoming/hooks/useUpcomingCatalog', () => ({
  useUpcomingCatalog: jest.fn(),
}));

describe('UpcomingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests followed scope for the home preview rail', () => {
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [upcomingItem, upcomingItemUnfollowed] }] },
      isLoading: false,
      isError: false,
    });

    render(<UpcomingSection />);

    expect(useUpcomingCatalog).toHaveBeenCalledWith('followed');
    expect(screen.getByText('Upcoming')).toBeTruthy();
    expect(screen.getByText('Avatar 4')).toBeTruthy();
    expect(screen.getByText('Mission: Impossible 9')).toBeTruthy();
    expect(screen.getByLabelText('Notified')).toBeTruthy();
  });

  it('returns null when there are no upcoming items', () => {
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [] }] },
      isLoading: false,
      isError: false,
    });

    const { toJSON } = render(<UpcomingSection />);
    expect(toJSON()).toBeNull();
  });

  it('renders TV episode items with season and episode labels', () => {
    const tvEpisodeItem = {
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      type: 'tv' as const,
      upcomingKind: 'TvEpisode' as const,
      title: 'Severance',
      originalTitle: 'Severance',
      overview: '',
      posterUrl: 'https://example.com/severance.jpg',
      backdropUrl: null,
      releaseDate: '2026-09-20',
      voteAverage: 0,
      voteCount: 0,
      year: 2026,
      isFollowed: true,
      episodeId: 'episode-id',
      seasonNumber: 2,
      episodeNumber: 1,
      episodeName: 'Hello, Ms. Cobel',
    };

    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [tvEpisodeItem] }] },
      isLoading: false,
      isError: false,
    });

    render(<UpcomingSection />);

    expect(screen.getByText('Severance')).toBeTruthy();
    expect(screen.getByText('S02 E01 · Hello, Ms. Cobel')).toBeTruthy();
  });

  it('calls onItemPress with the tapped item', () => {
    const onItemPress = jest.fn();
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [upcomingItem] }] },
      isLoading: false,
      isError: false,
    });

    render(<UpcomingSection onItemPress={onItemPress} />);
    fireEvent.press(screen.getByRole('button', { name: /Avatar 4/ }));

    expect(onItemPress).toHaveBeenCalledWith(upcomingItem);
  });
});
