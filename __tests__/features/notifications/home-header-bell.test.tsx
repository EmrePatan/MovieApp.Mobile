import { fireEvent, render, screen } from '@testing-library/react-native';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadNotificationCount';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/notifications/hooks/useUnreadNotificationCount', () => ({
  useUnreadNotificationCount: jest.fn(),
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
    (useUnreadNotificationCount as jest.Mock).mockReturnValue({
      data: { unreadCount: 0 },
    });
  });

  it('opens notifications without a badge when unread count is zero', () => {
    render(<HomeHeader />);

    fireEvent.press(screen.getByLabelText('Open notifications'));
    expect(mockPush).toHaveBeenCalledWith('/notifications');
    expect(screen.queryByText('9+')).toBeNull();
  });

  it('shows the unread count badge for 1 through 9', () => {
    (useUnreadNotificationCount as jest.Mock).mockReturnValue({
      data: { unreadCount: 3 },
    });

    render(<HomeHeader />);

    expect(screen.getByLabelText('Open notifications, 3 unread')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders profile avatar initials', () => {
    render(<HomeHeader />);

    expect(screen.getByLabelText('Open Emre User profile')).toBeTruthy();
    expect(screen.getByText('EU')).toBeTruthy();
  });

  it('shows 9+ when unread count exceeds nine', () => {
    (useUnreadNotificationCount as jest.Mock).mockReturnValue({
      data: { unreadCount: 12 },
    });

    render(<HomeHeader />);

    expect(screen.getByLabelText('Open notifications, 9+ unread')).toBeTruthy();
    expect(screen.getByText('9+')).toBeTruthy();
  });
});
