import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { spacing } from '@/theme/spacing';

interface InsightsSectionSkeletonProps {
  height: number;
}

export function InsightsSectionSkeleton({ height }: InsightsSectionSkeletonProps) {
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, { height }]}
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loadingInsightsSection')}
    >
      <SkeletonBlock width="40%" height={18} />
      <SkeletonBlock width="100%" height={height - 34} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
