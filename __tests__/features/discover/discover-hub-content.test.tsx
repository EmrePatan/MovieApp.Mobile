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

  it('marks future discovery features as coming soon', () => {
    render(<DiscoverHubContent />);

    expect(screen.getAllByText('Coming soon').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('Streaming Services')).toBeTruthy();
    expect(screen.getByText('Now in Theaters')).toBeTruthy();
  });
});
