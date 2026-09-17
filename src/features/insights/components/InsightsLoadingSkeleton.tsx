import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { InsightsSectionSkeleton } from './InsightsSectionSkeleton';
import { spacing } from '@/theme/spacing';

export function InsightsLoadingSkeleton() {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading insights"
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
