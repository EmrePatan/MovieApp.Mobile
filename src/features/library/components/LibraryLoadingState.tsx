import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface LibraryLoadingStateProps {
  accessibilityLabel?: string;
  rowCount?: number;
}

export function LibraryLoadingState({
  accessibilityLabel = 'Loading library',
  rowCount = 5,
}: LibraryLoadingStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      {Array.from({ length: rowCount }, (_, index) => (
        <View key={index} style={styles.row}>
          <SkeletonBlock
            width={layout.posterList.width}
            height={layout.posterList.height}
          />
          <View style={styles.meta}>
            <SkeletonBlock width="75%" height={18} />
            <SkeletonBlock width="50%" height={14} />
            <SkeletonBlock width="35%" height={12} />
          </View>
          <SkeletonBlock width={36} height={36} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
});
