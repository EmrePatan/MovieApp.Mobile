import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface CircularFlagBadgeProps {
  emoji: string;
  size?: 'default' | 'compact';
  /** Softer glass ring for flags overlaid on poster art */
  surface?: 'elevated' | 'poster';
}

export function CircularFlagBadge({
  emoji,
  size = 'default',
  surface = 'elevated',
}: CircularFlagBadgeProps) {
  const isCompact = size === 'compact';
  const isPosterSurface = surface === 'poster';
  return (
    <View
      style={[
        styles.flagBadge,
        isCompact && styles.flagBadgeCompact,
        isPosterSurface && styles.flagBadgePoster,
        isCompact && isPosterSurface && styles.flagBadgePosterCompact,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AppText
        style={[
          styles.flagEmoji,
          isCompact && styles.flagEmojiCompact,
          isPosterSurface && styles.flagEmojiPoster,
        ]}
      >
        {emoji}
      </AppText>
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
  flagBadgeCompact: {
    width: 22,
    height: 22,
  },
  flagBadgePoster: {
    backgroundColor: colors.accentSurface,
    borderColor: colors.borderSubtle,
  },
  flagBadgePosterCompact: {
    width: 20,
    height: 20,
  },
  flagEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
  flagEmojiCompact: {
    fontSize: 13,
    lineHeight: 15,
  },
  flagEmojiPoster: {
    fontSize: 12,
    lineHeight: 14,
  },
});
