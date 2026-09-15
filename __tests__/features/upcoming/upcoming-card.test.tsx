import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { UpcomingCard } from '@/features/upcoming/components/UpcomingCard';
import type { UpcomingCatalogItem } from '@/features/upcoming/types';
import * as dateUtils from '@/utils/date';

const movieItem: UpcomingCatalogItem = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  type: 'movie',
  upcomingKind: 'MovieRelease',
  title: 'Avatar 4',
  originalTitle: 'Avatar 4',
  overview: '',
  posterUrl: 'https://example.com/avatar.jpg',
  backdropUrl: null,
  releaseDate: '2026-12-19',
  voteAverage: 8.1,
  voteCount: 100,
  year: 2026,
  isFollowed: true,
};

const tvEpisodeItem: UpcomingCatalogItem = {
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  type: 'tv',
  upcomingKind: 'TvEpisode',
  title: 'Severance',
  originalTitle: 'Severance',
  overview: '',
  posterUrl: 'https://example.com/severance.jpg',
  backdropUrl: null,
  releaseDate: '2026-09-17',
  voteAverage: 0,
  voteCount: 0,
  year: 2026,
  isFollowed: true,
  episodeId: 'episode-id',
  seasonNumber: 2,
  episodeNumber: 3,
  episodeName: 'Who Are You?',
};

describe('UpcomingCard', () => {
  beforeEach(() => {
    jest.spyOn(dateUtils, 'formatRelativeAirDate').mockReturnValue('Tomorrow');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders movie upcoming item', () => {
    render(<UpcomingCard item={movieItem} />);

    expect(screen.getByText('Avatar 4')).toBeTruthy();
    expect(screen.getByText('★ 8.1')).toBeTruthy();
    expect(screen.queryByText(/S\d{2} E\d{2}/)).toBeNull();
  });

  it('renders followed TV episode with season, episode, and relative air date', () => {
    render(<UpcomingCard item={tvEpisodeItem} />);

    expect(screen.getByText('Severance')).toBeTruthy();
    expect(screen.getByText('S02 E03 · Who Are You?')).toBeTruthy();
    expect(screen.getByText('Tomorrow')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<UpcomingCard item={movieItem} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: /Avatar 4/ }));
    expect(onPress).toHaveBeenCalledWith(movieItem);
  });
});
