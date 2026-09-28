import type { TFunction } from 'i18next';

export function buildWatchlistShareMessage(shareUrl: string, t: TFunction): string {
  const intro = t('watchlistShare.messageIntro');
  return `${intro}\n${shareUrl}`;
}
