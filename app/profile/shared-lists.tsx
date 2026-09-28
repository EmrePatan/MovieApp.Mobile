import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { ProfileSubscreenHeader } from '@/features/profile/components/ProfileSubscreenHeader';
import { SharedWatchlistsContent } from '@/features/watchlist-share/components/SharedWatchlistsContent';

export default function SharedListsScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ProfileSubscreenHeader title={t('profile.sharedLists.title')} />
      <SharedWatchlistsContent />
    </Screen>
  );
}
