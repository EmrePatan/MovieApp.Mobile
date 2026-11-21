import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { ProfileSubscreenHeader } from '@/features/profile/components/ProfileSubscreenHeader';
import { normalizeRouteParam } from '@/features/navigation/normalize-route-param';
import { MyCommentsContent } from '@/features/reviews/components/MyCommentsContent';
import { buildUserCommentsReturnHref } from '@/features/details/shared/navigation/reviews-detail-navigation';

export default function UserCommentsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ userId: string | string[] }>();
  const userId = useMemo(() => normalizeRouteParam(params.userId), [params.userId]);

  return (
    <Screen padded={false}>
      <ProfileSubscreenHeader title={t('profile.myComments.otherTitle')} />
      {userId ? (
        <MyCommentsContent
          userId={userId}
          reviewsReturnHref={buildUserCommentsReturnHref(userId)}
        />
      ) : null}
    </Screen>
  );
}
