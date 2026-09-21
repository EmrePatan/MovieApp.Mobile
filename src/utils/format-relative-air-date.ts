import type { TFunction } from 'i18next';
import { formatRelativeAirDate } from './date';

export function formatRelativeAirDateLocalized(
  releaseDate: string | null | undefined,
  t: TFunction,
): string | null {
  const relative = formatRelativeAirDate(releaseDate);
  if (!relative) {
    return null;
  }

  if (relative === 'Today') {
    return t('date.relative.today');
  }

  if (relative === 'Tomorrow') {
    return t('date.relative.tomorrow');
  }

  const match = /^in (\d+) days$/.exec(relative);
  if (match) {
    return t('date.relative.inDays', { count: Number.parseInt(match[1], 10) });
  }

  return relative;
}
