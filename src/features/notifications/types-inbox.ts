export type NotificationsInboxSegment = 'social' | 'releases';

export function parseNotificationsInboxSegment(
  value: string | string[] | undefined,
): NotificationsInboxSegment | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'social' || raw === 'releases') {
    return raw;
  }
  return null;
}
