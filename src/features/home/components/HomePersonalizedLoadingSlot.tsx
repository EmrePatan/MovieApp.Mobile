import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const SKELETON_CARD_COUNT = 3;

export function HomePersonalizedLoadingSlot() {
  const { t } = useTranslation();

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loadingPersonalizedHome')}
    >
      <View style={styles.headerRow}>
        <SkeletonBlock width="48%" height={26} />
        <View style={styles.headerActionSpacer} />
      </View>
      <View style={styles.row}>
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, cardIndex) => (
          <View key={cardIndex} style={styles.card} accessibilityElementsHidden>
            <SkeletonBlock
              width={layout.posterCarousel.width}
              height={layout.posterCarousel.height}
            />
            <SkeletonBlock width={layout.posterCarousel.width} height={40} style={styles.metaPrimary} />
            <SkeletonBlock width={layout.posterCarousel.width * 0.7} height={16} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: layout.sectionGap,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerActionSpacer: {
    width: spacing.xl,
    height: 1,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: layout.cardGap,
  },
  card: {
    width: layout.posterCarousel.width,
  },
  metaPrimary: {
    marginTop: spacing.sm,
  },
});
