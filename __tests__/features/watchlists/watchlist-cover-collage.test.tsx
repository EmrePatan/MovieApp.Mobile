import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders as render } from '../../utils/render-with-providers';
import { Image } from 'expo-image';
import { WatchlistCoverCollage } from '@/features/watchlists/components/WatchlistCoverCollage';

jest.mock('@/auth/useAuth', () => ({ useAuth: jest.fn(() => ({ isAuthenticated: true, logout: jest.fn() })) }));

function posterCount(): number {
  return screen.UNSAFE_queryAllByType(Image).length;
}

describe('WatchlistCoverCollage', () => {
  it('renders nothing when the list has no posters', () => {
    render(<WatchlistCoverCollage posterPaths={[]} />);

    expect(screen.queryByTestId('watchlist-cover-collage')).toBeNull();
    expect(posterCount()).toBe(0);
  });

  it('renders a single poster as the whole cover', () => {
    render(<WatchlistCoverCollage posterPaths={['/one.jpg']} />);

    expect(screen.getByTestId('watchlist-cover-collage')).toBeTruthy();
    expect(posterCount()).toBe(1);
  });

  it('renders two posters side by side', () => {
    render(<WatchlistCoverCollage posterPaths={['/one.jpg', '/two.jpg']} />);

    expect(posterCount()).toBe(2);
  });

  it('caps the collage at four posters', () => {
    render(
      <WatchlistCoverCollage posterPaths={['/a.jpg', '/b.jpg', '/c.jpg', '/d.jpg', '/e.jpg']} />,
    );

    expect(posterCount()).toBe(4);
  });
});
