import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface ReviewsSectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  testID?: string;
}

export function ReviewsSectionHeader({
  title,
  actionLabel,
  onActionPress,
  testID,
}: ReviewsSectionHeaderProps) {
  return (
    <View style={styles.container} accessibilityRole="header" testID={testID}>
      <View style={styles.titleRow}>
        <AppText variant="subtitle" style={styles.title}>
          {title}
        </AppText>
        {actionLabel && onActionPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onActionPress}
            hitSlop={8}
          >
            <AppText variant="caption" style={styles.action}>
              {actionLabel}
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
    marginBottom: spacing.sm,
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
  action: {
    color: colors.accent,
    fontWeight: '600',
  },
  actionPlaceholder: {
    width: spacing.xl,
    height: 1,
  },
});
