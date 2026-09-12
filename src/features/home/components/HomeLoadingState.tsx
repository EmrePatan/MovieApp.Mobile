import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface HomeLoadingStateProps {
  showTopChrome?: boolean;
}

export function HomeLoadingState({ showTopChrome = true }: HomeLoadingStateProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel="Loading home">
      {showTopChrome ? (
        <>
          <SkeletonBlock width="100%" height={320} style={styles.heroSkeleton} />
          <View style={styles.filterRow}>
            <SkeletonBlock width={56} height={32} />
            <SkeletonBlock width={72} height={32} />
            <SkeletonBlock width={84} height={32} />
          </View>
        </>
      ) : null}
      {[0, 1, 2].map((sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <SkeletonBlock width="42%" height={18} />
          <View style={styles.row}>
            {[0, 1, 2].map((cardIndex) => (
              <SkeletonBlock
                key={cardIndex}
                width={layout.posterCarousel.width}
                height={layout.posterCarousel.height}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: layout.sectionGap,
  },
  heroSkeleton: {
    borderRadius: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  section: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  row: {
    flexDirection: 'row',
    gap: layout.cardGap,
  },
});
