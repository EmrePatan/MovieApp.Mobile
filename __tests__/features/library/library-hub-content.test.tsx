import { fireEvent, render, screen } from '@testing-library/react-native';
import { LibraryHubContent } from '@/features/library/components/LibraryHubContent';

const mockPush = jest.fn();
const mockOpenLibraryStackScreen = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({})),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(() => ({
    data: { displayName: 'Emre' },
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/profile/hooks/useProfileStatistics', () => ({
  useProfileStatistics: jest.fn(() => ({
    data: {
      summary: {
        moviesWatched: 12,
        episodesWatched: 48,
        showsStarted: 4,
        showsCompleted: 1,
        ratingsCount: 8,
        reviewsCount: 2,
        favoritesCount: 6,
        watchlistCount: 2,
        averageStarRating: 4.1,
      },
      activity: { last12Months: [] },
      genres: [],
      insights: [],
      milestones: [],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
  })),
}));

jest.mock('@/features/following/hooks/useFollowingCount', () => ({
  useFollowingCount: jest.fn(() => ({
    totalCount: 3,
    refetch: jest.fn(),
    isRefetching: false,
  })),
}));

jest.mock('@/features/home/hooks/useHome', () => ({
  useHome: jest.fn(() => ({
    data: {
      sections: [
        {
          type: 'ContinueWatching',
          title: 'Continue Watching',
          displayOrder: 1,
          items: [
            {
              id: 'tv-1',
              contentType: 'tv',
              title: 'In Progress Show',
              originalTitle: null,
              posterUrl: null,
              backdropUrl: null,
              releaseDate: null,
              voteAverage: 8,
              voteCount: 10,
              seasonNumber: 2,
              episodeNumber: 4,
              episodeName: 'Episode Four',
            },
          ],
        },
      ],
      isPersonalized: true,
    },
    refetch: jest.fn(),
    isRefetching: false,
  })),
}));

jest.mock('@/features/library/navigation/library-stack-navigation', () => ({
  openLibraryStackScreen: (...args: unknown[]) => mockOpenLibraryStackScreen(...args),
}));

describe('LibraryHubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders library summary and collection destinations', () => {
    render(<LibraryHubContent />);

    expect(screen.getByText('My Library')).toBeTruthy();
    expect(screen.getAllByText('Watching').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.getByLabelText('Favorites')).toBeTruthy();
    expect(screen.getByLabelText('Watch History')).toBeTruthy();
  });

  it('renders continue watching with episode detail and watching status', () => {
    render(<LibraryHubContent />);

    expect(screen.getByText('Continue Watching')).toBeTruthy();
    expect(screen.getByText('In Progress Show')).toBeTruthy();
    expect(screen.getByText('S2 · E4 · Episode Four')).toBeTruthy();
  });

  it('navigates to library destinations', () => {
    render(<LibraryHubContent />);

    fireEvent.press(screen.getByLabelText('Favorites'));

    expect(mockOpenLibraryStackScreen).toHaveBeenCalledWith(
      expect.anything(),
      '/favorites',
      '/(tabs)/library',
    );
  });
});
