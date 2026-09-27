import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { MyCommentsContent } from '@/features/reviews/components/MyCommentsContent';
import { spacing } from '@/theme/spacing';

export default function MyCommentsScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          {t('profile.myComments.title')}
        </AppText>
      </View>
      <MyCommentsContent />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
