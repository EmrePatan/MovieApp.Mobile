import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { spacing } from '@/theme/spacing';

interface InsightsSectionSkeletonProps {
  height: number;
}

export function InsightsSectionSkeleton({ height }: InsightsSectionSkeletonProps) {
  return (
    <View
      style={[styles.container, { height }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading insights section"
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
