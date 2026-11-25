import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders as render } from '../../utils/render-with-providers';
import { HomeContentCard } from '@/features/home/components/HomeContentCard';
import { HomeSection } from '@/features/home/components/HomeSection';
import { dismissRecommendation } from '@/features/recommendations/api/recommendations-api';
import { api } from '@/api/client';
import type { HomeItem } from '@/features/home/types';

jest.mock('@/auth/useAuth', () => ({ useAuth: jest.fn(() => ({ isAuthenticated: true, logout: jest.fn() })) }));
jest.mock('@/api/client', () => ({
  api: { post: jest.fn().mockResolvedValue(undefined) },
}));

const item: HomeItem = {
  id: 'interstellar',
  contentType: 'movie',
  title: 'Interstellar',
  originalTitle: 'Interstellar',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2014-11-07',
  voteAverage: 8.4,
  voteCount: 1000,
} as HomeItem;

describe('Home recommendation dismiss control', () => {
  it('does not render the dismiss control when no handler is provided', () => {
    render(<HomeContentCard item={item} />);

    expect(screen.queryByLabelText('Not interested')).toBeNull();
  });

  it('calls the dismiss handler without triggering card press', () => {
    const onDismiss = jest.fn();
    const onPress = jest.fn();

    render(<HomeContentCard item={item} onPress={onPress} onDismiss={onDismiss} />);

    fireEvent.press(screen.getByLabelText('Not interested'));

    expect(onDismiss).toHaveBeenCalledWith(item);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows the dismiss control only on personalized rails passed the handler', () => {
    const onItemDismiss = jest.fn();

    const { unmount } = render(
      <HomeSection
        section={{ type: 'RecommendedForYou', title: 'Recommended', displayOrder: 1, items: [item] }}
        onItemDismiss={onItemDismiss}
      />,
    );

    fireEvent.press(screen.getByLabelText('Not interested'));
    expect(onItemDismiss).toHaveBeenCalledWith(item);
    unmount();

    render(
      <HomeSection
        section={{ type: 'Trending', title: 'Trending', displayOrder: 2, items: [item] }}
      />,
    );

    expect(screen.queryByLabelText('Not interested')).toBeNull();
  });
});

describe('dismissRecommendation API', () => {
  it('posts the movie dismissal to the recommendations dismissals endpoint', async () => {
    await dismissRecommendation('movie', 'abc-123');

    expect(api.post).toHaveBeenCalledWith('/api/recommendations/dismissals', {
      contentType: 'movie',
      contentId: 'abc-123',
    });
  });
});
