import { fireEvent, render, screen } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import { NotificationRow } from '@/features/notifications/components/NotificationRow';
import NotificationsScreen from '../../../app/notifications';
import { useAuth } from '@/auth/useAuth';
import { useDeleteNotification } from '@/features/notifications/hooks/useDeleteNotification';
import { useMarkAllNotificationsRead } from '@/features/notifications/hooks/useMarkAllNotificationsRead';
import { useMarkNotificationRead } from '@/features/notifications/hooks/useMarkNotificationRead';
import { useNotificationsInbox } from '@/features/notifications/hooks/useNotificationsInbox';

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

jest.mock('@/features/notifications/hooks/useDeleteNotification', () => ({
  useDeleteNotification: jest.fn(),
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

function createDeleteMutationMock() {
  return {
    mutate: jest.fn(),
    isPending: false,
  };
}

describe('NotificationRow swipe delete', () => {
  const onDelete = jest.fn();
  const onPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not show a permanently visible delete control in the normal row state', () => {
    render(
      <NotificationRow item={unreadNotification} onPress={onPress} onDelete={onDelete} />,
    );

    expect(screen.queryByLabelText('Delete notification')).toBeNull();
  });

  it('reveals Delete after a left swipe', () => {
    render(
      <NotificationRow item={unreadNotification} onPress={onPress} onDelete={onDelete} />,
    );

    fireEvent.press(screen.getByLabelText('Reveal delete action'));

    expect(screen.getByLabelText('Delete notification')).toBeTruthy();
  });

  it('does not delete when the row is swiped open', () => {
    render(
      <NotificationRow item={unreadNotification} onPress={onPress} onDelete={onDelete} />,
    );

    fireEvent.press(screen.getByLabelText('Reveal delete action'));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('invokes delete with the notification item when Delete is tapped', () => {
    render(
      <NotificationRow item={unreadNotification} onPress={onPress} onDelete={onDelete} />,
    );

    fireEvent.press(screen.getByLabelText('Reveal delete action'));
    fireEvent.press(screen.getByLabelText('Delete notification'));

    expect(onDelete).toHaveBeenCalledWith(unreadNotification);
  });

  it('keeps notification tap behavior working', () => {
    render(
      <NotificationRow item={unreadNotification} onPress={onPress} onDelete={onDelete} />,
    );

    fireEvent.press(screen.getByRole('button', { name: /Dune: Part Three/ }));

    expect(onPress).toHaveBeenCalledWith(unreadNotification);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('preserves unread presentation for unread notifications', () => {
    render(
      <NotificationRow item={unreadNotification} onPress={onPress} onDelete={onDelete} />,
    );

    expect(screen.getByLabelText('Unread')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Unread, Dune: Part Three/ })).toBeTruthy();
  });

  it('preserves read presentation for read notifications', () => {
    render(
      <NotificationRow item={readNotification} onPress={onPress} onDelete={onDelete} />,
    );

    expect(screen.queryByLabelText('Unread')).toBeNull();
    expect(screen.getByRole('button', { name: /^Severance\./ })).toBeTruthy();
  });

  it('exposes an accessibility delete action on the row', () => {
    render(
      <NotificationRow item={unreadNotification} onPress={onPress} onDelete={onDelete} />,
    );

    fireEvent(
      screen.getByRole('button', { name: /Dune: Part Three/ }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'delete' } },
    );

    expect(onDelete).toHaveBeenCalledWith(unreadNotification);
  });
});

describe('NotificationsScreen delete integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useNotificationsInbox as jest.Mock).mockReturnValue({
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
    });
    (useMarkNotificationRead as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    (useMarkAllNotificationsRead as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    (useDeleteNotification as jest.Mock).mockReturnValue(createDeleteMutationMock());
  });

  it('invokes the existing delete mutation with unread state when Delete is tapped', () => {
    const deleteMutation = createDeleteMutationMock();
    (useDeleteNotification as jest.Mock).mockReturnValue(deleteMutation);

    render(<NotificationsScreen />);

    fireEvent.press(screen.getAllByLabelText('Reveal delete action')[0]);
    fireEvent.press(screen.getByLabelText('Delete notification'));

    expect(deleteMutation.mutate).toHaveBeenCalledWith({
      notificationId: unreadNotification.id,
      wasUnread: true,
    });
  });

  it('keeps vertical list virtualization settings intact', () => {
    const { UNSAFE_getByType } = render(<NotificationsScreen />);
    const flatList = UNSAFE_getByType(FlatList);

    expect(flatList.props.onEndReachedThreshold).toBe(0.4);
    expect(flatList.props.initialNumToRender).toBeDefined();
    expect(flatList.props.maxToRenderPerBatch).toBeDefined();
    expect(flatList.props.windowSize).toBeDefined();
  });
});
