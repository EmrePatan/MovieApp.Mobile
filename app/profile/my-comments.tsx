import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { MyCommentsContent } from '@/features/reviews/components/MyCommentsContent';
import { MY_COMMENTS_HORIZONTAL_INSET } from '@/features/reviews/utils/my-comments-layout';
import { spacing } from '@/theme/spacing';

export default function MyCommentsScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <View
        style={styles.header}
        accessibilityRole="header"
        accessibilityLabel={t('profile.myComments.title')}
      >
        <DetailBackButton showLabel={false} />
      </View>
      <MyCommentsContent />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: MY_COMMENTS_HORIZONTAL_INSET,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
});
