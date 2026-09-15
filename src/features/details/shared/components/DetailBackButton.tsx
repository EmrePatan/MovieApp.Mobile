import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import {
  isRootCatalogDetailRoute,
  returnToCatalogDetailOrigin,
} from '../navigation/catalog-detail-navigation';
import {
  isLibraryStackRoute,
  returnFromLibraryStackScreen,
} from '@/features/library/navigation/library-stack-navigation';
import {
  isGalleryDetailRoute,
  returnFromGalleryDetail,
} from '../navigation/gallery-detail-navigation';
import {
  isCreditsDetailRoute,
  returnFromCreditsDetail,
} from '../navigation/credits-detail-navigation';
import {
  isPersonFilmographyRoute,
  returnFromPersonFilmography,
} from '../navigation/person-filmography-navigation';
import {
  isPersonDetailRoute,
  returnFromPersonDetail,
} from '../navigation/person-detail-navigation';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface DetailBackButtonProps {
  label?: string;
  topOffset?: number;
  variant?: 'inline' | 'overlay';
  contentInset?: boolean;
}

export function DetailBackButton({
  label,
  topOffset = 0,
  variant = 'inline',
  contentInset = true,
}: DetailBackButtonProps) {
  const router = useRouter();
  const segments = useSegments();
  const accessibilityLabel = label ?? (variant === 'overlay' ? 'Go back' : 'Back');
  const displayLabel = label ?? 'Back';

  const handleBack = useCallback(() => {
    if (isLibraryStackRoute(segments)) {
      returnFromLibraryStackScreen(router);
      return;
    }

    if (isRootCatalogDetailRoute(segments)) {
      returnToCatalogDetailOrigin(router);
      return;
    }

    if (isCreditsDetailRoute(segments)) {
      returnFromCreditsDetail(router);
      return;
    }

    if (isPersonFilmographyRoute(segments)) {
      returnFromPersonFilmography(router);
      return;
    }

    if (isPersonDetailRoute(segments)) {
      returnFromPersonDetail(router);
      return;
    }

    if (isGalleryDetailRoute(segments)) {
      returnFromGalleryDetail(router);
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
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
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
      <AppText variant="body">{displayLabel}</AppText>
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
    width: interaction.touchTarget,
    height: interaction.touchTarget,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
