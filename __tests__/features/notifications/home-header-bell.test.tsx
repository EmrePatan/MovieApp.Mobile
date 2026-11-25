import { fireEvent, render, screen } from '@testing-library/react-native';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { useCombinedUnreadNotificationCount } from '@/features/notifications/hooks/useCombinedUnreadNotificationCount';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/notifications/hooks/useCombinedUnreadNotificationCount', () => ({
  useCombinedUnreadNotificationCount: jest.fn(),
}));

jest.mock('@/features/messages/hooks/useMessageQueries', () => ({
  useDirectMessageUnreadCount: () => ({ data: 0, isLoading: false, isError: false }),
}));

jest.mock('@/features/social/hooks/useSocialQueries', () => ({
  useSocialPendingFollowRequestCount: () => ({ data: 0 }),
  useSocialUnreadNotificationCount: () => ({ data: 0 }),
}));


jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'emre@example.com',
      userName: 'emre',
      displayName: 'Emre User',
      createdAt: '2026-01-01T00:00:00Z',
    },
  }),
}));

describe('HomeHeader notification bell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCombinedUnreadNotificationCount as jest.Mock).mockReturnValue({
      unreadCount: 0,
      releasesUnread: 0,
      socialUnread: 0,
      isLoading: false,
      isError: false,
    });
  });

  it('opens notifications without a badge when unread count is zero', () => {
    render(<HomeHeader />);

    fireEvent.press(screen.getByLabelText('Open notifications'));
    expect(mockPush).toHaveBeenCalledWith('/notifications');
    expect(screen.queryByText('9+')).toBeNull();
  });

  it('shows the unread count badge for 1 through 9', () => {
    (useCombinedUnreadNotificationCount as jest.Mock).mockReturnValue({
      unreadCount: 3,
      releasesUnread: 2,
      socialUnread: 1,
      isLoading: false,
      isError: false,
    });

    render(<HomeHeader />);

    expect(screen.getByLabelText('Open notifications, 3 unread')).toBeTruthy();
    expect(screen.getByText('3', { includeHiddenElements: true })).toBeTruthy();
  });

  it('opens messages from the header', () => {
    render(<HomeHeader />);

    fireEvent.press(screen.getByLabelText('Open messages'));
    expect(mockPush).toHaveBeenCalledWith('/messages');
  });

  it('shows 9+ when unread count exceeds nine', () => {
    (useCombinedUnreadNotificationCount as jest.Mock).mockReturnValue({
      unreadCount: 12,
      releasesUnread: 5,
      socialUnread: 7,
      isLoading: false,
      isError: false,
    });

    render(<HomeHeader />);

    expect(screen.getByLabelText('Open notifications, 9+ unread')).toBeTruthy();
    expect(screen.getByText('9+', { includeHiddenElements: true })).toBeTruthy();
  });


  it('hides search, notifications and messages on the library tab chrome', () => {
    render(<HomeHeader searchOrigin="library" />);

    expect(screen.queryByLabelText('Search movies or series')).toBeNull();
    expect(screen.queryByLabelText('Open notifications')).toBeNull();
    expect(screen.queryByLabelText('Open messages')).toBeNull();
  });
});
