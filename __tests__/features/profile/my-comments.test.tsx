import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import ProfileScreen from '../../../app/(tabs)/profile';
import { MyCommentsContent } from '@/features/reviews/components/MyCommentsContent';
import { MyCommentRow } from '@/features/reviews/components/MyCommentRow';
import { i18n } from '@/i18n';
import { useAuth } from '@/auth/useAuth';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useMyComments } from '@/features/reviews/hooks/useMyComments';
import type { UserReviewListItem } from '@/features/reviews/types/my-comments';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useSegments: () => ['(tabs)', 'profile'],
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: jest.fn(() => ({
    region: 'TR',
    source: 'fallback',
    isHydrated: true,
    setRegion: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  })),
}));

jest.mock('@/features/locale/hooks/useLocalePreference', () => ({
  useLocalePreference: jest.fn(() => ({
    language: 'en',
    setLanguage: jest.fn(),
  })),
}));

jest.mock('@/features/reviews/hooks/useMyComments', () => ({
  useMyComments: jest.fn(),
}));

const movieItem: UserReviewListItem = {
  id: 'review-movie',
  contentType: 'movie',
  contentId: 'movie-1',
  title: 'Interstellar',
  posterPath: '/poster.jpg',
  releaseDate: '2014-11-07',
  content: 'A mind-bending journey through space and time.',
  createdAt: '2026-09-24T00:00:00Z',
  updatedAt: '2026-09-24T00:00:00Z',
  userRating: 8,
};

const tvItem: UserReviewListItem = {
  id: 'review-tv',
  contentType: 'tv',
  contentId: 'tv-1',
  title: 'Reacher',
  posterPath: '/tv.jpg',
  releaseDate: '2022-02-04',
  content: 'Solid action with a great lead performance.',
  createdAt: '2026-09-23T00:00:00Z',
  updatedAt: '2026-09-23T00:00:00Z',
  userRating: 10,
};

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe('My Comments profile feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ logout: jest.fn(), isAuthenticated: true });
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: {
        id: 'user-id',
        email: 'user@example.com',
        userName: 'user',
        displayName: 'Emre',
        createdAt: '2026-09-11T14:30:00Z',
        hasPassword: true,
        linkedProviders: [],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
  });

  it('shows My Comments row and navigates to the screen', () => {
    renderWithI18n(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText('💬  My Comments'));
    expect(mockPush).toHaveBeenCalledWith('/profile/my-comments');
  });

  it('renders empty state when the user has no comments', () => {
    (useMyComments as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [], page: 1, pageSize: 15, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }] },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    renderWithI18n(<MyCommentsContent />);

    expect(screen.getByText('You have not reviewed anything yet')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Go to Discover'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/(app-shell)/discover');
  });

  it('renders movie and TV rows and opens catalog detail', () => {
    const onPress = jest.fn();

    render(
      <MyCommentRow item={movieItem} onPress={onPress} />,
    );
    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByText('Movie · 2014')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Interstellar, Movie · 2014'));
    expect(onPress).toHaveBeenCalledWith(movieItem);

    render(
      <MyCommentRow item={tvItem} onPress={onPress} />,
    );
    expect(screen.getByText('Reacher')).toBeTruthy();
    expect(screen.getByText('TV · 2022')).toBeTruthy();
  });

  it('loads filtered lists through the media filter control', () => {
    const fetchNextPage = jest.fn();
    (useMyComments as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [movieItem],
            page: 1,
            pageSize: 15,
            totalCount: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage,
      refetch: jest.fn(),
    });

    renderWithI18n(<MyCommentsContent />);

    expect(screen.getByText('Interstellar')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Filter Movies'));
    expect(useMyComments).toHaveBeenCalled();
  });
});
