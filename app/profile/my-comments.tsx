import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { ProfileSubscreenHeader } from '@/features/profile/components/ProfileSubscreenHeader';
import { MyCommentsContent } from '@/features/reviews/components/MyCommentsContent';

export default function MyCommentsScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ProfileSubscreenHeader title={t('profile.myComments.title')} />
      <MyCommentsContent />
    </Screen>
  );
}
