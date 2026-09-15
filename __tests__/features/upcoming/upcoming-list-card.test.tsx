import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { UpcomingListCard } from '@/features/upcoming/components/UpcomingListCard';
import type { UpcomingCatalogItem } from '@/features/upcoming/types';

const movieItem: UpcomingCatalogItem = {
  id: 'movie-id',
  type: 'movie',
  upcomingKind: 'MovieRelease',
  title: 'Avatar 4',
  originalTitle: 'Avatar 4',
  overview: '',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2026-12-19',
  voteAverage: 8,
  voteCount: 10,
  year: 2026,
  isFollowed: true,
};

describe('UpcomingListCard', () => {
  it('renders movie release in list layout with followed badge', () => {
    render(<UpcomingListCard item={movieItem} />);

    expect(screen.getByText('Avatar 4')).toBeTruthy();
    expect(screen.getByText('Release')).toBeTruthy();
    expect(screen.getByText('Alert on')).toBeTruthy();
  });
});
