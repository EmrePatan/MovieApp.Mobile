import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { StyleSheet, View } from 'react-native';

interface HomeSectionHeaderProps {
  title: string;
}

export function HomeSectionHeader({ title }: HomeSectionHeaderProps) {
  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.titleRow}>
        <AppText variant="subtitle" style={styles.title}>{title}</AppText>
        <View style={styles.actionPlaceholder} accessibilityElementsHidden />
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
  actionPlaceholder: {
    width: spacing.xl,
    height: 1,
  },
});
