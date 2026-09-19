import { getUiFormatLocaleTag, i18n } from '@/i18n';

export function formatNotificationRelativeTime(createdAtUtc: string): string {
  const createdAt = new Date(createdAtUtc);
  if (Number.isNaN(createdAt.getTime())) {
    return '';
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffMinutes < 1) {
    return i18n.t('notifications.relativeTime.justNow');
  }

  if (diffMinutes < 60) {
    return i18n.t('notifications.relativeTime.minutesAgo', { count: diffMinutes });
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return i18n.t('notifications.relativeTime.hoursAgo', { count: diffHours });
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return i18n.t('notifications.relativeTime.daysAgo', { count: diffDays });
  }

  return createdAt.toLocaleDateString(getUiFormatLocaleTag(), {
    month: 'short',
    day: 'numeric',
    year: createdAt.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
