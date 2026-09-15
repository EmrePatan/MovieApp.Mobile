import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { HOME_HEADER_COMPACT_TARGET } from './home-header-styles';

interface HomeHeaderIconButtonProps {
  accessibilityLabel: string;
  onPress: () => void;
  children: ReactNode;
  overlay?: boolean;
  compact?: boolean;
  badgeLabel?: string | null;
}

export function HomeHeaderIconButton({
  accessibilityLabel,
  onPress,
  children,
  overlay = false,
  compact = false,
  badgeLabel = null,
}: HomeHeaderIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        overlay && !compact && styles.buttonOverlay,
        pressed && styles.pressed,
      ]}
    >
      {children}
      {badgeLabel ? (
        <View style={styles.badge} accessibilityLabel={`${badgeLabel} unread notifications`}>
          <AppText variant="caption" style={styles.badgeText}>
            {badgeLabel}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: {
    minWidth: HOME_HEADER_COMPACT_TARGET,
    minHeight: HOME_HEADER_COMPACT_TARGET,
  },
  buttonOverlay: {
    minWidth: 40,
    minHeight: 40,
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
