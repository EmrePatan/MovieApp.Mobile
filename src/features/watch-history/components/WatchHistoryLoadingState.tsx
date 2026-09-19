import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export function WatchHistoryLoadingState() {
  const { t } = useTranslation();

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loadingWatchHistory')}
    >
      {[0, 1, 2, 3].map((index) => (
        <View key={index} style={styles.row}>
          <SkeletonBlock width="55%" height={18} />
          <SkeletonBlock width="35%" height={14} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
