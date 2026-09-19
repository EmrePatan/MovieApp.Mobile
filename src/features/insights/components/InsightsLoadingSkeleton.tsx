import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { InsightsSectionSkeleton } from './InsightsSectionSkeleton';
import { spacing } from '@/theme/spacing';

export function InsightsLoadingSkeleton() {
  const { t } = useTranslation();

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loadingInsights')}
    >
      <SkeletonBlock width="100%" height={220} />
      <InsightsSectionSkeleton height={160} />
      <InsightsSectionSkeleton height={180} />
      <InsightsSectionSkeleton height={140} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
});
