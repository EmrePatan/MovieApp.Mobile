import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HomeContentCard } from '@/features/home/components/HomeContentCard';
import { HomeTypeFilterControl } from '@/features/home/components/HomeTypeFilterControl';
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState';
import { HomeSection } from '@/features/home/components/HomeSection';
import type { HomeSection as HomeSectionModel } from '@/features/home/types';

describe('Home UI components', () => {
  it('renders the type filter control', () => {
    const onChange = jest.fn();

    render(<HomeTypeFilterControl value="all" onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Show Movies'));
    expect(onChange).toHaveBeenCalledWith('movie');
  });

  it('renders an empty state message', () => {
    render(<HomeEmptyState />);

    expect(screen.getByText('Nothing to watch yet')).toBeTruthy();
  });

  it('renders a section with cards', () => {
    const section: HomeSectionModel = {
      type: 'Trending',
      title: 'Trending',
      displayOrder: 1,
      items: [
        {
          id: '1',
          contentType: 'movie',
          title: 'Interstellar',
          originalTitle: 'Interstellar',
          posterUrl: 'https://example.com/poster.jpg',
          backdropUrl: null,
          releaseDate: '2014-11-07',
          voteAverage: 8.4,
          voteCount: 1000,
        },
      ],
    };

    render(<HomeSection section={section} onSeeAllPress={jest.fn()} />);

    expect(screen.getByText('Trending')).toBeTruthy();
    expect(screen.getByText('See All')).toBeTruthy();
    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByText('Movie · 2014 · ★ 8.4')).toBeTruthy();
  });

  it('does not render empty sections', () => {
    const section: HomeSectionModel = {
      type: 'ContinueWatching',
      title: 'Continue Watching',
      displayOrder: 1,
      items: [],
    };

    const { toJSON } = render(<HomeSection section={section} />);
    expect(toJSON()).toBeNull();
  });

  it('renders continue watching without playback progress UI', () => {
    render(
      <HomeContentCard
        item={{
          id: 'tv-id',
          contentType: 'tv',
          title: 'Breaking Bad',
          originalTitle: 'Breaking Bad',
          posterUrl: null,
          backdropUrl: null,
          releaseDate: '2008-01-20',
          voteAverage: 8.9,
          voteCount: 12000,
        }}
      />,
    );

    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByText('TV · 2008 · ★ 8.9')).toBeTruthy();
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
