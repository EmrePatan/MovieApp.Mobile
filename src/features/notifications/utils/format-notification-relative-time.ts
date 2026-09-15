export function formatNotificationRelativeTime(createdAtUtc: string): string {
  const createdAt = new Date(createdAtUtc);
  if (Number.isNaN(createdAt.getTime())) {
    return '';
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return createdAt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: createdAt.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
