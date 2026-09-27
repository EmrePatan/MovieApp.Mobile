import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface CircularFlagBadgeProps {
  emoji: string;
}

export function CircularFlagBadge({ emoji }: CircularFlagBadgeProps) {
  return (
    <View
      style={styles.flagBadge}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AppText style={styles.flagEmoji}>{emoji}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flagBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flagEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
});
