import { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePathname } from 'expo-router';

import * as Linking from 'expo-linking';

import { useTranslation } from 'react-i18next';

import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/common/AppText';

import { DETAIL_ACTION_SIZE } from '@/features/details/shared/components/DetailCircularAction';

import { DetailDirectionalFrame } from '@/features/details/shared/components/DetailDirectionalFrame';

import { DETAIL_DIRECTIONAL_FRAME_BORDER } from '@/features/details/shared/detailDirectionalFrame';

import {
  loadOptionalUpdateDismissal,
  saveOptionalUpdateDismissal,
  shouldShowOptionalUpdateAfterDismissal,
} from '../optional-update-dismissal-storage';

import {
  canOpenOptionalUpdate,
  shouldDismissOptionalUpdate,
} from '../optional-update-presentation';

import { shouldDismissOptionalUpdateOnRouteChange } from '../optional-update-route-dismiss';

import { useAppConfig } from '../hooks/useAppConfig';

import { colors } from '@/theme/colors';

import { borderRadius, spacing } from '@/theme/spacing';

import { interaction } from '@/theme/interaction';

import { typography } from '@/theme/typography';

/** Detail “İzledim” seçili yüzeyi — modal içinde tekrar kullanım (paylaşılan bileşen değiştirilmez). */

const DETAIL_ACTION_ACTIVE_SURFACE = 'rgba(12, 12, 18, 0.78)' as const;

const optionalUpdateIconBadgeSize = typography.bodySmall.lineHeight + spacing.sm;

/** Tema + detail action ölçeğinden türetilmiş banner metrikleri. */

const optionalUpdateBannerMetrics = {
  topInsetExtra: spacing.sm,

  iconBadgeSize: optionalUpdateIconBadgeSize,

  iconGlyphSize: Math.round((optionalUpdateIconBadgeSize / DETAIL_ACTION_SIZE) * 22),

  iconTitleGap: spacing.sm,

  closeIconSize: typography.caption.fontSize + spacing.xs,

  updateButtonMinHeight: typography.caption.lineHeight + spacing.md,
} as const;

type OptionalUpdateGoldPillButtonProps = {
  label: string;

  accessibilityLabel: string;

  onPress: () => void;

  style?: StyleProp<ViewStyle>;
};

function OptionalUpdateGoldPillButton({
  label,

  accessibilityLabel,

  onPress,

  style,
}: OptionalUpdateGoldPillButtonProps) {
  const pillRadius = borderRadius.full;

  const innerRadius = Math.max(0, pillRadius - DETAIL_DIRECTIONAL_FRAME_BORDER);

  return (
    <Pressable
      accessibilityRole="button"

      accessibilityLabel={accessibilityLabel}

      onPress={onPress}

      hitSlop={spacing.xs}

      style={({ pressed }) => [style, pressed && styles.updateButtonPressed]}
    >
      <DetailDirectionalFrame
        variant="gold"
        borderRadius={pillRadius}
        glow
        style={styles.updateFrame}
      >
        <View
          style={[
            styles.optionalUpdateGoldInner,

            styles.updateButtonInner,

            {
              borderRadius: innerRadius,

              minHeight: optionalUpdateBannerMetrics.updateButtonMinHeight,
            },
          ]}
        >
          <AppText variant="caption" style={styles.updateLabel} numberOfLines={1}>
            {label}
          </AppText>
        </View>
      </DetailDirectionalFrame>
    </Pressable>
  );
}

type OptionalUpdateIconBadgeProps = {
  size: number;

  iconSize: number;
};

function OptionalUpdateIconBadge({ size, iconSize }: OptionalUpdateIconBadgeProps) {
  const outerRadius = size / 2;

  const innerRadius = Math.max(0, outerRadius - DETAIL_DIRECTIONAL_FRAME_BORDER);

  const innerSize = size - DETAIL_DIRECTIONAL_FRAME_BORDER * 2;

  return (
    <DetailDirectionalFrame
      variant="gold"
      borderRadius={outerRadius}
      glow
      style={{ width: size, height: size }}
    >
      <View
        style={[
          styles.optionalUpdateGoldInner,

          {
            width: innerSize,

            height: innerSize,

            borderRadius: innerRadius,
          },
        ]}
      >
        <Ionicons name="arrow-down-circle-outline" size={iconSize} color={colors.accent} />
      </View>
    </DetailDirectionalFrame>
  );
}

export function OptionalUpdateModal() {
  const { t } = useTranslation();

  const insets = useSafeAreaInsets();

  const pathname = usePathname();

  const {
    evaluation,
    config,
    suppressOptionalUpdateForSession,
    optionalUpdateSessionSuppressed,
  } = useAppConfig();

  const [visible, setVisible] = useState(false);

  const isVisibleRef = useRef(false);

  const routePathRef = useRef<string | null>(null);

  const setBannerVisible = useCallback((nextVisible: boolean) => {
    if (isVisibleRef.current === nextVisible) {
      return;
    }

    isVisibleRef.current = nextVisible;

    setVisible(nextVisible);

    if (nextVisible) {
      routePathRef.current = pathname;
    }
  }, [pathname]);

  const hideBannerSessionOnly = useCallback(() => {
    suppressOptionalUpdateForSession();

    setBannerVisible(false);
  }, [setBannerVisible, suppressOptionalUpdateForSession]);

  const syncVisibility = useCallback(
    async (options?: { forceClose?: boolean }) => {
      if (
        options?.forceClose ||
        shouldDismissOptionalUpdate(evaluation.updatePrompt, evaluation.storeUrl)
      ) {
        setBannerVisible(false);

        return;
      }

      const platformConfig = Platform.OS === 'ios' ? config.versions.ios : config.versions.android;

      const dismissal = await loadOptionalUpdateDismissal();

      const persistedAllowsShow = shouldShowOptionalUpdateAfterDismissal(
        platformConfig.latestBuild,

        dismissal,
      );

      const canOpen = canOpenOptionalUpdate({
        updatePrompt: evaluation.updatePrompt,

        storeUrl: evaluation.storeUrl,

        isAlreadyVisible: isVisibleRef.current,

        dismissedThisSession: false,

        sessionSuppressed: optionalUpdateSessionSuppressed,

        persistedAllowsShow,
      });

      if (!canOpen) {
        return;
      }

      if (!isVisibleRef.current) {
        setBannerVisible(true);
      }
    },

    [
      config.versions.android,

      config.versions.ios,

      evaluation.storeUrl,

      evaluation.updatePrompt,

      optionalUpdateSessionSuppressed,

      setBannerVisible,
    ],
  );

  useEffect(() => {
    void syncVisibility();
  }, [syncVisibility]);

  useEffect(() => {
    if (
      !shouldDismissOptionalUpdateOnRouteChange(
        isVisibleRef.current,
        routePathRef.current,
        pathname,
      )
    ) {
      if (!isVisibleRef.current) {
        routePathRef.current = pathname;
      }

      return;
    }

    hideBannerSessionOnly();

    routePathRef.current = pathname;
  }, [hideBannerSessionOnly, pathname]);

  const dismissWithLaterReminder = useCallback(async () => {
    const platformConfig = Platform.OS === 'ios' ? config.versions.ios : config.versions.android;

    await saveOptionalUpdateDismissal(platformConfig.latestBuild);

    hideBannerSessionOnly();
  }, [config.versions.android, config.versions.ios, hideBannerSessionOnly]);

  const handleClose = () => {
    void dismissWithLaterReminder();
  };

  const handleUpdate = () => {
    if (evaluation.storeUrl) {
      void Linking.openURL(evaluation.storeUrl);
    }

    hideBannerSessionOnly();
  };

  if (!visible) {
    return null;
  }

  const title = t('appConfig.optionalUpdate.title');

  return (
    <View style={styles.overlayHost} pointerEvents="box-none" accessibilityViewIsModal>
      <View style={styles.host} pointerEvents="box-none">
        <View
          pointerEvents="box-none"

          style={[
            styles.anchor,
            { paddingTop: insets.top + optionalUpdateBannerMetrics.topInsetExtra },
          ]}
        >
          <View style={styles.card} accessibilityRole="alert" accessibilityLabel={title}>
            <View
              style={styles.iconSlot}

              accessible={false}

              importantForAccessibility="no-hide-descendants"
            >
              <OptionalUpdateIconBadge
                size={optionalUpdateBannerMetrics.iconBadgeSize}

                iconSize={optionalUpdateBannerMetrics.iconGlyphSize}
              />
            </View>

            <AppText
              variant="bodySmall"

              style={styles.title}

              numberOfLines={1}

              ellipsizeMode="tail"
            >
              {title}
            </AppText>

            <OptionalUpdateGoldPillButton
              label={t('appConfig.optionalUpdate.updateButton')}

              accessibilityLabel={t('appConfig.optionalUpdate.updateButtonAccessibility')}

              onPress={handleUpdate}

              style={styles.updateButtonSlot}
            />

            <Pressable
              accessibilityRole="button"

              accessibilityLabel={t('appConfig.optionalUpdate.closeButtonAccessibility')}

              onPress={handleClose}

              hitSlop={spacing.sm}

              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Ionicons
                name="close"

                size={optionalUpdateBannerMetrics.closeIconSize}

                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayHost: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 30,

    justifyContent: 'flex-start',
  },

  host: {
    justifyContent: 'flex-start',
  },

  anchor: {
    paddingHorizontal: spacing.md,
  },

  card: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.xs,

    minHeight: interaction.touchTarget,

    paddingVertical: spacing.xs,

    paddingLeft: spacing.xs,

    paddingRight: spacing.xs,

    borderRadius: borderRadius.lg,

    backgroundColor: colors.surfaceElevated,

    borderWidth: 1,

    borderColor: colors.borderAccent,

    shadowColor: colors.background,

    shadowOpacity: 0.28,

    shadowRadius: spacing.sm,

    shadowOffset: { width: 0, height: spacing.xs },

    elevation: spacing.sm,
  },

  iconSlot: {
    marginRight: optionalUpdateBannerMetrics.iconTitleGap - spacing.xs,

    flexShrink: 0,
  },

  title: {
    flex: 1,

    flexShrink: 1,

    minWidth: 0,

    fontWeight: '600',

    color: colors.textPrimary,
  },

  updateButtonSlot: {
    flexShrink: 0,
  },

  updateFrame: {
    alignSelf: 'flex-start',
  },

  optionalUpdateGoldInner: {
    backgroundColor: DETAIL_ACTION_ACTIVE_SURFACE,

    alignItems: 'center',

    justifyContent: 'center',
  },

  updateButtonInner: {
    paddingHorizontal: spacing.md,

    paddingVertical: spacing.xs,
  },

  updateButtonPressed: {
    opacity: interaction.pressedOpacity,
  },

  updateLabel: {
    color: colors.accent,

    fontWeight: '600',
  },

  closeButton: {
    flexShrink: 0,

    width: interaction.touchTarget,

    height: interaction.touchTarget,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: -spacing.xs,
  },

  closeButtonPressed: {
    opacity: interaction.pressedOpacity,
  },
});
