import { type ReactNode } from 'react';
import { BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { MovieCaveLogo } from '@/features/branding/components/MovieCaveLogo';
import { getMovieCaveLogoHeight } from '@/features/branding/movie-cave-branding';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

const DEFAULT_BLOCKING_ICON_GLYPH_SIZE = 32;
const FORCED_UPDATE_ICON_GLYPH_SIZE = 36;
const FORCED_UPDATE_PRIMARY_BUTTON_WIDTH_RATIO = 0.82;

type BlockingIconName = keyof typeof Ionicons.glyphMap;

interface AppBlockingStateProps {
  icon: BlockingIconName;
  title: string;
  body: string;
  primaryLabel: string;
  primaryAccessibilityLabel: string;
  onPrimaryPress: () => void;
  primaryLoading?: boolean;
  footer?: ReactNode;
  preventHardwareBack?: boolean;
  /** Forced-update polish: tighter logo/icon group, compact CTA, slightly larger glyph. */
  presentation?: 'default' | 'forcedUpdate';
}

function getLogoWidth(screenWidth: number): number {
  const contentWidth = screenWidth - layout.screenPaddingHorizontal * 2;
  return Math.min(240, Math.max(200, Math.round(contentWidth * 0.62)));
}

export function AppBlockingState({
  icon,
  title,
  body,
  primaryLabel,
  primaryAccessibilityLabel,
  onPrimaryPress,
  primaryLoading = false,
  footer,
  preventHardwareBack = false,
  presentation = 'default',
}: AppBlockingStateProps) {
  const { width } = useWindowDimensions();
  const logoWidth = getLogoWidth(width);
  const logoHeight = getMovieCaveLogoHeight(logoWidth);
  const contentWidth = width - layout.screenPaddingHorizontal * 2;
  const isForcedUpdatePresentation = presentation === 'forcedUpdate';
  const iconGlyphSize = isForcedUpdatePresentation
    ? FORCED_UPDATE_ICON_GLYPH_SIZE
    : DEFAULT_BLOCKING_ICON_GLYPH_SIZE;
  const primaryButtonWidth = isForcedUpdatePresentation
    ? Math.max(
        interaction.touchTarget,
        Math.min(360, Math.round(contentWidth * FORCED_UPDATE_PRIMARY_BUTTON_WIDTH_RATIO)),
      )
    : undefined;

  useEffect(() => {
    if (!preventHardwareBack) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [preventHardwareBack]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content} accessibilityViewIsModal importantForAccessibility="yes">
        {isForcedUpdatePresentation ? (
          <View style={styles.logoIconGroup}>
            <MovieCaveLogo width={logoWidth} height={logoHeight} />
            <View
              style={styles.iconWrap}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              <Ionicons name={icon} size={iconGlyphSize} color={colors.accent} />
            </View>
          </View>
        ) : (
          <>
            <MovieCaveLogo width={logoWidth} height={logoHeight} style={styles.logo} />
            <View
              style={styles.iconWrap}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              <Ionicons name={icon} size={iconGlyphSize} color={colors.accent} />
            </View>
          </>
        )}
        <AppText variant="title" center accessibilityRole="header">
          {title}
        </AppText>
        <AppText variant="bodySmall" muted center style={styles.body}>
          {body}
        </AppText>
        <AppButton
          title={primaryLabel}
          accessibilityLabel={primaryAccessibilityLabel}
          onPress={onPrimaryPress}
          loading={primaryLoading}
          style={[
            styles.button,
            primaryButtonWidth != null && {
              alignSelf: 'center',
              width: primaryButtonWidth,
              maxWidth: primaryButtonWidth,
            },
          ]}
        />
        {footer}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.md,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  logoIconGroup: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: {
    maxWidth: 320,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
    maxWidth: 360,
  },
});
