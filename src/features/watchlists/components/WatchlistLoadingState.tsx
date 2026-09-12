import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface WatchlistLoadingStateProps {
  accessibilityLabel?: string;
}

export function WatchlistLoadingState({
  accessibilityLabel = 'Loading watchlist',
}: WatchlistLoadingStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      {[0, 1, 2].map((index) => (
        <View key={index} style={styles.row}>
          <SkeletonBlock
            width={layout.posterList.width}
            height={layout.posterList.height}
          />
          <View style={styles.meta}>
            <SkeletonBlock width="70%" height={18} />
            <SkeletonBlock width="45%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  meta: {
    flex: 1,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
