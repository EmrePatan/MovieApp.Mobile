import type { NotificationResponse } from 'expo-notifications';
import {
  buildSocialPushRoute,
  getLastProcessedNotificationResponseKeyForTests,
  getPendingNotificationResponseForTests,
  getNotificationResponseKey,
  parseNotificationIdFromPushData,
  processNotificationResponse,
  resetNotificationBootstrapStateForTests,
  setPendingNotificationResponseForTests,
} from '@/features/notifications/services/notification-bootstrap';

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
}));

const mockMarkNotificationRead = jest.fn();
const mockMarkSocialNotificationRead = jest.fn().mockResolvedValue(undefined);

jest.mock('@/features/social/api/social-api', () => ({
  markSocialNotificationRead: (...args: unknown[]) => mockMarkSocialNotificationRead(...args),
}));

jest.mock('@/features/notifications/api/notifications-api', () => ({
  markNotificationRead: (...args: unknown[]) => mockMarkNotificationRead(...args),
}));

function createNotificationResponse(
  data: Record<string, unknown>,
  identifier = 'request-id',
): NotificationResponse {
  return {
    actionIdentifier: 'expo.modules.notifications.actions.DEFAULT',
    notification: {
      date: Date.now(),
      request: {
        identifier,
        content: {
          title: 'Dune: Part Three',
          body: 'Now available',
          data,
        },
        trigger: null,
      },
    },
  } as NotificationResponse;
}

describe('notification push bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetNotificationBootstrapStateForTests();
    mockMarkNotificationRead.mockResolvedValue({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      readAtUtc: '2026-09-14T19:00:00Z',
      contentType: 'movie',
      contentId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    });
  });

  it('parses notificationId from push data', () => {
    expect(
      parseNotificationIdFromPushData({
        notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        movieId: 'untrusted-id',
      }),
    ).toBe('3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('stores pending responses while logged out', async () => {
    const response = createNotificationResponse({
      notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      movieId: 'untrusted-id',
    });

    await processNotificationResponse(response, {
      isAuthenticated: false,
      navigate: jest.fn(),
      invalidateNotifications: jest.fn(),
    });

    expect(getPendingNotificationResponseForTests()).toBe(response);
    expect(mockMarkNotificationRead).not.toHaveBeenCalled();
  });

  it('marks notification read and navigates using API response content', async () => {
    const navigate = jest.fn();
    const invalidateNotifications = jest.fn();
    const response = createNotificationResponse({
      notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      movieId: 'untrusted-id',
    });

    await processNotificationResponse(response, {
      isAuthenticated: true,
      navigate,
      invalidateNotifications,
    });

    expect(mockMarkNotificationRead).toHaveBeenCalledWith(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    expect(navigate).toHaveBeenCalledWith('/movie/7c9e6679-7425-40de-944b-e07fc1f90ae7');
    expect(invalidateNotifications).toHaveBeenCalled();
    expect(getNotificationResponseKey(response)).toBe(
      getLastProcessedNotificationResponseKeyForTests(),
    );
  });

  it('prevents duplicate navigation when the same response is processed concurrently', async () => {
    let resolveRead: (value: {
      id: string;
      readAtUtc: string;
      contentType: string;
      contentId: string;
    }) => void = () => {};
    mockMarkNotificationRead.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRead = resolve;
        }),
    );
    const navigate = jest.fn();
    const response = createNotificationResponse({
      notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
    const options = {
      isAuthenticated: true,
      navigate,
      invalidateNotifications: jest.fn(),
    };

    const first = processNotificationResponse(response, options);
    const second = processNotificationResponse(response, options);
    resolveRead({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      readAtUtc: '2026-09-14T19:00:00Z',
      contentType: 'movie',
      contentId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    });
    await Promise.all([first, second]);

    expect(mockMarkNotificationRead).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicate navigation for the same response', async () => {
    const navigate = jest.fn();
    const response = createNotificationResponse({
      notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });

    await processNotificationResponse(response, {
      isAuthenticated: true,
      navigate,
      invalidateNotifications: jest.fn(),
    });

    await processNotificationResponse(response, {
      isAuthenticated: true,
      navigate,
      invalidateNotifications: jest.fn(),
    });

    expect(mockMarkNotificationRead).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('opens the conversation from a direct-message push', async () => {
    const navigate = jest.fn();
    const invalidateNotifications = jest.fn();

    await processNotificationResponse(
      createNotificationResponse(
        {
          type: 'direct-message',
          conversationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
        'dm-request',
      ),
      {
        isAuthenticated: true,
        navigate,
        invalidateNotifications,
      },
    );

    expect(mockMarkNotificationRead).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(
      '/(tabs)/(app-shell)/messages/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    expect(invalidateNotifications).toHaveBeenCalled();
  });

  it('opens the post from a social push and marks the social notification read', async () => {
    const navigate = jest.fn();
    const invalidateNotifications = jest.fn();

    await processNotificationResponse(
      createNotificationResponse(
        {
          type: 'social',
          notificationType: 'CommentReply',
          notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          activityId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          actorId: '11111111-2222-3333-4444-555555555555',
        },
        'social-request',
      ),
      { isAuthenticated: true, navigate, invalidateNotifications },
    );

    expect(mockMarkNotificationRead).not.toHaveBeenCalled();
    expect(mockMarkSocialNotificationRead).toHaveBeenCalledWith(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    expect(navigate).toHaveBeenCalledWith(
      '/(tabs)/(app-shell)/social/7c9e6679-7425-40de-944b-e07fc1f90ae7',
    );
    expect(invalidateNotifications).toHaveBeenCalled();
  });

  it('routes follow pushes to requests or the follower profile', () => {
    expect(
      buildSocialPushRoute({ notificationType: 'FollowRequest', actorId: 'actor-1' }),
    ).toBe('/(tabs)/(app-shell)/social-requests');
    expect(buildSocialPushRoute({ notificationType: 'NewFollower', actorId: 'actor-1' })).toBe(
      '/(tabs)/(app-shell)/social-profile/actor-1',
    );
    expect(buildSocialPushRoute({ notificationType: 'NewFollower' })).toBeNull();
  });

  it('does not navigate when mark read fails', async () => {
    mockMarkNotificationRead.mockRejectedValueOnce(new Error('not found'));
    const navigate = jest.fn();

    await processNotificationResponse(
      createNotificationResponse({
        notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      }),
      {
        isAuthenticated: true,
        navigate,
        invalidateNotifications: jest.fn(),
      },
    );

    expect(navigate).not.toHaveBeenCalled();
  });

  it('exposes pending response for post-auth processing', () => {
    const response = createNotificationResponse({
      notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });

    setPendingNotificationResponseForTests(response);
    expect(getPendingNotificationResponseForTests()).toBe(response);
  });
});
