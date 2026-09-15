import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { DiscoveryWatchProvider } from '../watch-provider-types';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const PROVIDER_LOGO_SIZE = 54;

interface WatchProviderLogoProps {
  provider: DiscoveryWatchProvider;
  selected?: boolean;
}

export function WatchProviderLogo({ provider, selected = false }: WatchProviderLogoProps) {
  const logoUri = resolveImageUri(provider.logoPath);

  return (
    <View style={[styles.logoCircle, selected && styles.logoCircleSelected]}>
      {logoUri ? (
        <Image source={{ uri: logoUri }} style={styles.logoImage} resizeMode="contain" />
      ) : (
        <View style={styles.logoFallback}>
          <AppText variant="caption" style={styles.logoFallbackText}>
            {provider.name.charAt(0)}
          </AppText>
        </View>
      )}
    </View>
  );
}

export const watchProviderLogoSize = PROVIDER_LOGO_SIZE;

const styles = StyleSheet.create({
  logoCircle: {
    width: PROVIDER_LOGO_SIZE,
    height: PROVIDER_LOGO_SIZE,
    borderRadius: PROVIDER_LOGO_SIZE / 2,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  logoCircleSelected: {
    borderColor: colors.accent,
  },
  logoImage: {
    width: PROVIDER_LOGO_SIZE - 10,
    height: PROVIDER_LOGO_SIZE - 10,
    borderRadius: borderRadius.md,
  },
  logoFallback: {
    width: PROVIDER_LOGO_SIZE - 10,
    height: PROVIDER_LOGO_SIZE - 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  logoFallbackText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
