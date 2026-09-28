import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import {
  isLibraryStackRoute,
  returnFromLibraryStackScreen,
} from '@/features/library/navigation/library-stack-navigation';
import {
  isReviewsDetailRoute,
  returnFromReviewsScreen,
} from '../navigation/reviews-detail-navigation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { DetailNeutralIconControl } from './DetailNeutralIconControl';

interface DetailBackButtonProps {
  label?: string;
  topOffset?: number;
  variant?: 'inline' | 'overlay';
  contentInset?: boolean;
  showLabel?: boolean;
}

export function DetailBackButton({
  label,
  topOffset = 0,
  variant = 'inline',
  contentInset = true,
  showLabel = true,
}: DetailBackButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const segments = useSegments();
  const accessibilityLabel =
    label ?? (variant === 'overlay' ? t('common.goBack') : t('common.back'));
  const displayLabel = label ?? t('common.back');

  const handleBack = useCallback(() => {
    if (isLibraryStackRoute(segments)) {
      returnFromLibraryStackScreen(router);
      return;
    }

    if (isReviewsDetailRoute(segments)) {
      if (returnFromReviewsScreen(router)) {
        return;
      }

      if (router.canGoBack()) {
        router.back();
      }
      return;
    }

    router.back();
  }, [router, segments]);

  if (variant === 'overlay') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={handleBack}
        style={({ pressed }) => [
          styles.overlayButton,
          { top: topOffset },
          pressed && styles.pressed,
        ]}
      >
        <DetailNeutralIconControl>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </DetailNeutralIconControl>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handleBack}
      style={({ pressed }) => [
        styles.inlineButton,
        contentInset ? styles.inlineButtonContentInset : styles.inlineButtonStandalone,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      {showLabel ? <AppText variant="body">{displayLabel}</AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: interaction.touchTarget,
    minWidth: interaction.touchTarget,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  inlineButtonContentInset: {
    paddingLeft: 0,
    paddingRight: spacing.md,
  },
  inlineButtonStandalone: {
    paddingHorizontal: spacing.lg,
  },
  overlayButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 20,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
