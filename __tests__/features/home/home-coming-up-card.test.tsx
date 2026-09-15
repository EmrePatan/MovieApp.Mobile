import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HomeComingUpCard } from '@/features/home/components/HomeComingUpCard';
import type { HomeItem } from '@/features/home/types';

const item: HomeItem = {
  id: 'show-id',
  contentType: 'tv',
  title: 'Followed Show',
  originalTitle: null,
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2026-09-17',
  voteAverage: 0,
  voteCount: 0,
  upcomingKind: 'TvEpisode',
  episodeId: 'episode-id',
  seasonNumber: 1,
  episodeNumber: 2,
  episodeName: 'Next Episode',
};

describe('HomeComingUpCard', () => {
  it('renders show title, season episode, episode name, and relative air date', () => {
    render(<HomeComingUpCard item={item} />);

    expect(screen.getByText('Followed Show')).toBeTruthy();
    expect(screen.getByText('S01 E02 · Next Episode')).toBeTruthy();
    expect(screen.getByLabelText(/Followed Show, S01 E02, Next Episode/)).toBeTruthy();
  });
});
