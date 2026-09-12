import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export function HomeLoadingState() {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel="Loading home">
      {[0, 1, 2].map((sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <SkeletonBlock width="45%" height={20} />
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
    paddingTop: spacing.md,
    gap: layout.sectionGap,
  },
  section: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
