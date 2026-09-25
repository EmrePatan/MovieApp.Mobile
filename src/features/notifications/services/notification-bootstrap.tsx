import { useCallback, useEffect, type ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
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

  const notificationId = parseNotificationIdFromPushData(
    response.notification.request.content.data as Record<string, unknown> | undefined,
  );

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
  const { isAuthenticated, isLoading } = useAuth();

  const invalidateNotifications = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
