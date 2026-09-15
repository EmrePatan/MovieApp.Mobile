import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface HomeSectionHeaderProps {
  title: string;
  onSeeAllPress?: () => void;
}

export function HomeSectionHeader({ title, onSeeAllPress }: HomeSectionHeaderProps) {
  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.titleRow}>
        <AppText variant="subtitle" style={styles.title}>{title}</AppText>
        {onSeeAllPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}
            onPress={onSeeAllPress}
            hitSlop={8}
          >
            <AppText variant="caption" style={styles.seeAll}>
              See All
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.actionPlaceholder} accessibilityElementsHidden />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  seeAll: {
    color: colors.accent,
    fontWeight: '600',
  },
  actionPlaceholder: {
    width: spacing.xl,
    height: 1,
  },
});
