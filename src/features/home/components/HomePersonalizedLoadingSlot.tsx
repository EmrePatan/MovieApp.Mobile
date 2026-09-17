import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export function HomePersonalizedLoadingSlot() {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading personalized home content"
    >
      <SkeletonBlock width="48%" height={18} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: layout.sectionGap,
  },
  row: {
    flexDirection: 'row',
    gap: layout.cardGap,
  },
});
