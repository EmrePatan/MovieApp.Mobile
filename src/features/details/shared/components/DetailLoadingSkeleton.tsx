import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { DetailBackButton } from './DetailBackButton';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function DetailLoadingSkeleton() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroHeight = Math.round(Math.min(320, Math.max(220, width * 0.52)));

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { height: heroHeight }]}>
        <SkeletonBlock width="100%" height={heroHeight} />
        <DetailBackButton variant="overlay" topOffset={insets.top + spacing.sm} />
      </View>
      <View style={styles.body}>
        <SkeletonBlock width="72%" height={28} />
        <SkeletonBlock width="48%" height={16} />
        <SkeletonBlock width="100%" height={44} />
        <SkeletonBlock width="100%" height={120} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.surfaceElevated,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
});
