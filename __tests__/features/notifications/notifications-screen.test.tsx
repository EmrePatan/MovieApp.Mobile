import { FlatList } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useAuth } from '@/auth/useAuth';
import { useMarkAllNotificationsRead } from '@/features/notifications/hooks/useMarkAllNotificationsRead';
import { useMarkNotificationRead } from '@/features/notifications/hooks/useMarkNotificationRead';
import { useNotificationsInbox } from '@/features/notifications/hooks/useNotificationsInbox';
import NotificationsScreen from '../../../app/notifications';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: jest.fn() }),
  useSegments: jest.fn(() => []),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/notifications/hooks/useNotificationsInbox', () => ({
  useNotificationsInbox: jest.fn(),
}));

jest.mock('@/features/notifications/hooks/useMarkNotificationRead', () => ({
  useMarkNotificationRead: jest.fn(),
}));

jest.mock('@/features/notifications/hooks/useMarkAllNotificationsRead', () => ({
  useMarkAllNotificationsRead: jest.fn(),
}));

const unreadNotification = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  type: 'MovieReleased' as const,
  title: 'Dune: Part Three',
  body: 'Dune: Part Three is now available.',
  createdAtUtc: '2026-09-14T18:30:00Z',
  readAtUtc: null,
  contentType: 'movie' as const,
  contentId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  posterPath: '/dune.jpg',
};

const readNotification = {
  ...unreadNotification,
  id: '8fa85f64-5717-4562-b3fc-2c963f66afa7',
  title: 'Severance',
  body: 'A new season is available.',
  readAtUtc: '2026-09-14T19:00:00Z',
  contentType: 'tv' as const,
  contentId: '9c9e6679-7425-40de-944b-e07fc1f90ae8',
};

function createNotificationsQueryMock(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      pages: [
        {
          items: [unreadNotification, readNotification],
          page: 1,
          pageSize: 20,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
    isFetchingNextPage: false,
    isFetching: false,
    isFetchNextPageError: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    ...overrides,
  };
}

function createMarkReadMutationMock() {
  return {
    mutate: jest.fn(),
    isPending: false,
  };
}

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useNotificationsInbox as jest.Mock).mockReturnValue(createNotificationsQueryMock());
    (useMarkNotificationRead as jest.Mock).mockReturnValue(createMarkReadMutationMock());
    (useMarkAllNotificationsRead as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it('renders logged-out state', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    render(<NotificationsScreen />);

    expect(screen.getByText('Sign in to view your notifications')).toBeTruthy();
    fireEvent.press(screen.getByText('Sign In'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
  });

  it('renders loading state', () => {
    (useNotificationsInbox as jest.Mock).mockReturnValue(
      createNotificationsQueryMock({
        data: undefined,
        isLoading: true,
      }),
    );

    render(<NotificationsScreen />);

    expect(screen.getByLabelText('Loading notifications')).toBeTruthy();
  });

  it('marks unread notification read and navigates on tap', () => {
    const markRead = createMarkReadMutationMock();
    (useMarkNotificationRead as jest.Mock).mockReturnValue(markRead);

    render(<NotificationsScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Dune: Part Three/ }));
    expect(markRead.mutate).toHaveBeenCalledWith(unreadNotification.id);
    expect(mockPush).toHaveBeenCalledWith('/movie/7c9e6679-7425-40de-944b-e07fc1f90ae7');
  });

  it('does not mark already-read notifications on tap', () => {
    const markRead = createMarkReadMutationMock();
    (useMarkNotificationRead as jest.Mock).mockReturnValue(markRead);

    render(<NotificationsScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Severance/ }));
    expect(markRead.mutate).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/tv/9c9e6679-7425-40de-944b-e07fc1f90ae8');
  });

  it('marks all notifications read optimistically', () => {
    const markAllRead = { mutate: jest.fn(), isPending: false };
    (useMarkAllNotificationsRead as jest.Mock).mockReturnValue(markAllRead);

    render(<NotificationsScreen />);

    fireEvent.press(screen.getByLabelText('Mark all as read'));
    expect(markAllRead.mutate).toHaveBeenCalled();
  });

  it('renders empty state when there are no notifications', () => {
    (useNotificationsInbox as jest.Mock).mockReturnValue(
      createNotificationsQueryMock({
        data: {
          pages: [
            {
              items: [],
              page: 1,
              pageSize: 20,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          ],
        },
      }),
    );

    render(<NotificationsScreen />);

    expect(screen.getByText('No notifications yet')).toBeTruthy();
  });

  it('renders error state with retry', () => {
    const refetch = jest.fn();
    (useNotificationsInbox as jest.Mock).mockReturnValue(
      createNotificationsQueryMock({
        data: undefined,
        isError: true,
        refetch,
      }),
    );

    render(<NotificationsScreen />);

    expect(screen.getByText('Unable to load notifications. Please try again.')).toBeTruthy();
    fireEvent.press(screen.getByText('Retry'));
    expect(refetch).toHaveBeenCalled();
  });

  it('loads the next page when more pages are available', () => {
    const fetchNextPage = jest.fn();
    (useNotificationsInbox as jest.Mock).mockReturnValue(
      createNotificationsQueryMock({
        hasNextPage: true,
        fetchNextPage,
      }),
    );

    const { UNSAFE_getByType } = render(<NotificationsScreen />);

    UNSAFE_getByType(FlatList).props.onEndReached?.();
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
