import { useCallback, useEffect, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { ensurePushDeviceRegisteredAsync } from '@/features/follows/services/push-device-service';
import { markSocialNotificationRead } from '@/features/social/api/social-api';
import { markNotificationRead } from '../api/notifications-api';
import { buildNotificationRoute } from '../utils/notification-navigation';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function parseNotificationIdFromPushData(
  data: Record<string, unknown> | undefined,
): string | null {
  const notificationId = data?.notificationId;
  if (typeof notificationId !== 'string' || notificationId.trim().length === 0) {
    return null;
  }

  return notificationId.trim();
}

export function getNotificationResponseKey(
  response: Notifications.NotificationResponse,
): string {
  const notificationId = parseNotificationIdFromPushData(
    response.notification.request.content.data as Record<string, unknown> | undefined,
  );

  return notificationId ?? response.notification.request.identifier;
}

function readPushId(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/** Where a tapped social push (like, comment, reply, follow) should open. */
export function buildSocialPushRoute(data: Record<string, unknown>): string | null {
  const activityId = readPushId(data.activityId);
  if (activityId) {
    return `/(tabs)/(app-shell)/social/${activityId}`;
  }

  if (data.notificationType === 'FollowRequest') {
    return '/(tabs)/(app-shell)/social-requests';
  }

  const actorId = readPushId(data.actorId);
  return actorId ? `/(tabs)/(app-shell)/social-profile/${actorId}` : null;
}

let pendingNotificationResponse: Notifications.NotificationResponse | null = null;
let lastProcessedNotificationResponseKey: string | null = null;
const inFlightNotificationResponseKeys = new Set<string>();

export function resetNotificationBootstrapStateForTests(): void {
  pendingNotificationResponse = null;
  lastProcessedNotificationResponseKey = null;
  inFlightNotificationResponseKeys.clear();
}

export function setPendingNotificationResponseForTests(
  response: Notifications.NotificationResponse | null,
): void {
  pendingNotificationResponse = response;
}

export function getPendingNotificationResponseForTests(): Notifications.NotificationResponse | null {
  return pendingNotificationResponse;
}

export function getLastProcessedNotificationResponseKeyForTests(): string | null {
  return lastProcessedNotificationResponseKey;
}

export async function processNotificationResponse(
  response: Notifications.NotificationResponse,
  options: {
    isAuthenticated: boolean;
    navigate: (route: string) => void;
    invalidateNotifications: () => void;
  },
): Promise<void> {
  const responseKey = getNotificationResponseKey(response);

  if (
    lastProcessedNotificationResponseKey === responseKey ||
    inFlightNotificationResponseKeys.has(responseKey)
  ) {
    return;
  }

  if (!options.isAuthenticated) {
    pendingNotificationResponse = response;
    return;
  }

  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  if (data?.type === 'direct-message') {
    const conversationId = data.conversationId == null ? '' : String(data.conversationId).trim();
    inFlightNotificationResponseKeys.add(responseKey);
    try {
      lastProcessedNotificationResponseKey = responseKey;
      if (!conversationId) {
        return;
      }

      options.invalidateNotifications();
      options.navigate(`/(tabs)/(app-shell)/messages/${conversationId}`);
    } finally {
      inFlightNotificationResponseKeys.delete(responseKey);
    }
    return;
  }

  if (data?.type === 'social') {
    inFlightNotificationResponseKeys.add(responseKey);
    try {
      lastProcessedNotificationResponseKey = responseKey;
      const socialNotificationId = parseNotificationIdFromPushData(data);
      if (socialNotificationId) {
        // Best effort: opening the target matters more than the unread flag.
        void markSocialNotificationRead(socialNotificationId).catch(() => undefined);
      }

      options.invalidateNotifications();
      const route = buildSocialPushRoute(data);
      if (route) {
        options.navigate(route);
      }
    } finally {
      inFlightNotificationResponseKeys.delete(responseKey);
    }
    return;
  }

  const notificationId = parseNotificationIdFromPushData(data);

  if (!notificationId) {
    return;
  }

  inFlightNotificationResponseKeys.add(responseKey);

  try {
    const readResponse = await markNotificationRead(notificationId);
    lastProcessedNotificationResponseKey = responseKey;
    options.invalidateNotifications();
    options.navigate(
      buildNotificationRoute(readResponse.contentType, readResponse.contentId),
    );
  } catch {
    // Ownership validation failed or notification no longer exists.
  } finally {
    inFlightNotificationResponseKeys.delete(responseKey);
  }
}

interface NotificationBootstrapProviderProps {
  children: ReactNode;
}

export function NotificationBootstrapProvider({
  children,
}: NotificationBootstrapProviderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading, user } = useAuth();
  const userId = user?.id;

  const invalidateNotifications = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    void queryClient.invalidateQueries({ queryKey: ['messages'] });
    void queryClient.invalidateQueries({ queryKey: ['social', 'notifications'] });
  }, [queryClient]);

  const navigate = useCallback(
    (route: string) => {
      router.push(route);
    },
    [router],
  );

  const processResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      void processNotificationResponse(response, {
        isAuthenticated,
        navigate,
        invalidateNotifications,
      });
    },
    [isAuthenticated, invalidateNotifications, navigate],
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
      invalidateNotifications();
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        processResponse(response);
      },
    );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        processResponse(response);
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [invalidateNotifications, processResponse]);

  // Ask for notification permission once a signed-in user is known, and keep the backend's Expo
  // token current. Registering only at login (without asking) left fresh installs with no
  // permission prompt and restored sessions pointing at a dead install's token, so message and
  // social pushes were accepted by APNs but never shown.
  useEffect(() => {
    if (Platform.OS === 'web' || !userId) {
      return;
    }

    const syncPushDevice = () => {
      void ensurePushDeviceRegisteredAsync().catch((error: unknown) => {
        console.warn('[Push] Device registration failed', error);
      });
    };

    syncPushDevice();
    const tokenSubscription = Notifications.addPushTokenListener(() => {
      syncPushDevice();
    });

    return () => {
      tokenSubscription.remove();
    };
  }, [userId]);

  // Query timers do not run while the app is suspended and window-focus refetch is off, so the
  // bell would stay stale until the app was killed and reopened. Refresh it on every return.
  useEffect(() => {
    if (Platform.OS === 'web' || !isAuthenticated) {
      return;
    }

    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (previousState !== 'active' && nextState === 'active') {
        invalidateNotifications();
      }
      previousState = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [invalidateNotifications, isAuthenticated]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !pendingNotificationResponse) {
      return;
    }

    const response = pendingNotificationResponse;
    pendingNotificationResponse = null;
    processResponse(response);
  }, [isAuthenticated, isLoading, processResponse]);

  return children;
}
