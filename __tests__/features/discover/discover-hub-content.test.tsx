import { fireEvent, render, screen } from '@testing-library/react-native';
import { DiscoverHubContent } from '@/features/discover/components/DiscoverHubContent';

const mockPush = jest.fn();
const mockOpenLibraryStackScreen = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));

jest.mock('@/features/discovery/hooks/useExplorePreview', () => ({
  useExplorePreview: jest.fn(() => ({
    data: {
      trending: { items: [] },
      topRated: { items: [] },
    },
  })),
}));

jest.mock('@/features/discovery/hooks/useGenres', () => ({
  useGenres: jest.fn(() => ({
    data: [{ id: 'genre-1', name: 'Action' }],
  })),
}));

jest.mock('@/features/discovery/hooks/useNowInTheatersPreview', () => ({
  useNowInTheatersPreview: jest.fn(() => ({
    data: {
      items: [
        {
          id: 'movie-1',
          type: 'movie',
          title: 'Cinema One',
          posterUrl: '/poster.jpg',
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/discovery/hooks/useOnTvThisWeekPreview', () => ({
  useOnTvThisWeekPreview: jest.fn(() => ({
    data: {
      items: [
        {
          id: 'tv-1',
          type: 'tv',
          title: 'Airing Drama',
          posterUrl: '/poster.jpg',
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/library/navigation/library-stack-navigation', () => ({
  openLibraryStackScreen: (...args: unknown[]) => mockOpenLibraryStackScreen(...args),
}));

jest.mock('@/features/navigation/components/GlobalSearchEntry', () => ({
  GlobalSearchEntry: ({ origin }: { origin: string }) => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return React.createElement(
      Pressable,
      { accessibilityLabel: `Global search from ${origin}` },
      React.createElement(Text, null, 'Search movies, TV & people'),
    );
  },
}));

describe('DiscoverHubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the discover hub search entry and D1 filters entry', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByText('Discover')).toBeTruthy();
    expect(screen.getByLabelText('Global search from discover')).toBeTruthy();
    expect(screen.getByLabelText('Explore with Filters')).toBeTruthy();
    expect(screen.getByText('Genre · Year · Rating · Runtime · Country')).toBeTruthy();
  });

  it('opens advanced discover from Explore with Filters', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByLabelText('Explore with Filters'));

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/advanced-discover'));
  });

  it('activates Streaming Services and keeps later phases as coming soon', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByLabelText('Streaming Services')).toBeTruthy();
    expect(screen.getAllByText('Coming soon').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('World Cinema')).toBeTruthy();
  });

  it('renders On TV This Week preview section with See All', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByTestId('on-tv-this-week-preview')).toBeTruthy();
    expect(screen.getByLabelText('See all On TV This Week')).toBeTruthy();
  });

  it('opens on tv this week from See All', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByLabelText('See all On TV This Week'));

    expect(mockPush).toHaveBeenCalledWith('/on-tv-this-week');
  });

  it('renders Now in Theaters preview section with See All', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByTestId('now-in-theaters-preview')).toBeTruthy();
    expect(screen.getByLabelText('See all Now in Theaters')).toBeTruthy();
  });

  it('opens now in theaters from See All', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByLabelText('See all Now in Theaters'));

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/now-in-theaters'));
  });

  it('opens streaming discover from Streaming Services', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByLabelText('Streaming Services'));

    expect(mockPush).toHaveBeenCalledWith('/streaming-discover');
  });
});
