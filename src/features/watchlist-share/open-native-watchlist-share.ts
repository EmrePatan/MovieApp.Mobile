import { Platform, Share } from 'react-native';
import type { TFunction } from 'i18next';
import { buildWatchlistShareMessage } from './build-watchlist-share-message';

export async function openNativeWatchlistShare(shareUrl: string, t: TFunction): Promise<void> {
  const message = buildWatchlistShareMessage(shareUrl, t);
  const content = { message, title: t('common.watchlist') };

  if (Platform.OS === 'android') {
    await Share.share(content, { dialogTitle: t('watchlists.optionsSheet.shareList') });
    return;
  }

  await Share.share(content);
}
