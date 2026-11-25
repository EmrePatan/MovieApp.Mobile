import { useMemo } from 'react';
import { useSocialUnreadNotificationCount } from '@/features/social/hooks/useSocialQueries';
import { useUnreadNotificationCount } from './useUnreadNotificationCount';

function normalizeCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (value && typeof value === 'object' && 'unreadCount' in value) {
    const nested = (value as { unreadCount: unknown }).unreadCount;
    if (typeof nested === 'number' && Number.isFinite(nested)) {
      return Math.max(0, nested);
    }
  }

  return 0;
}

export function useCombinedUnreadNotificationCount() {
  const releasesQuery = useUnreadNotificationCount();
  const socialQuery = useSocialUnreadNotificationCount();

  const releasesUnread = normalizeCount(releasesQuery.data);
  const socialUnread = normalizeCount(socialQuery.data);
  const unreadCount = releasesUnread + socialUnread;

  return useMemo(
    () => ({
      unreadCount,
      releasesUnread,
      socialUnread,
      isLoading: releasesQuery.isLoading || socialQuery.isLoading,
      isError: releasesQuery.isError || socialQuery.isError,
    }),
    [
      releasesUnread,
      socialUnread,
      unreadCount,
      releasesQuery.isLoading,
      socialQuery.isLoading,
      releasesQuery.isError,
      socialQuery.isError,
    ],
  );
}
