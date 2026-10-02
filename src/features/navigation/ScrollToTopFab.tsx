import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveTabBarLayoutMetrics } from '@/features/navigation/tab-bar-layout-metrics';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { shadows } from '@/theme/shadows';

export type ScrollToTopFabPlacement = 'abovePrimaryTabBar' | 'aboveSafeArea';

interface ScrollToTopFabProps {
  visible: boolean;
  onPress: () => void;
  placement?: ScrollToTopFabPlacement;
  testID?: string;
}

export function ScrollToTopFab({
  visible,
  onPress,
  placement = 'abovePrimaryTabBar',
  testID = 'scroll-to-top-fab',
}: ScrollToTopFabProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottom =
    placement === 'abovePrimaryTabBar'
      ? resolveTabBarLayoutMetrics(insets).totalHeight + spacing.md
      : spacing.lg + insets.bottom;

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.anchor, { bottom }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.scrollToTopAccessibility')}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        testID={testID}
      >
        <Ionicons name="chevron-up" size={22} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
