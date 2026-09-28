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
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

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
}: AppBlockingStateProps) {
  const { width } = useWindowDimensions();
  const logoWidth = getLogoWidth(width);
  const logoHeight = getMovieCaveLogoHeight(logoWidth);

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
        <MovieCaveLogo width={logoWidth} height={logoHeight} style={styles.logo} />
        <View style={styles.iconWrap} accessible={false} importantForAccessibility="no-hide-descendants">
          <Ionicons name={icon} size={32} color={colors.accent} />
        </View>
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
          style={styles.button}
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
