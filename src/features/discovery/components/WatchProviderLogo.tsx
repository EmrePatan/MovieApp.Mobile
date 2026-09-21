import { StyleSheet, View } from 'react-native';
import { ProviderLogoImage } from '@/components/common/ProviderLogoImage';
import type { DiscoveryWatchProvider } from '../watch-provider-types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const PROVIDER_LOGO_SIZE = 54;

interface WatchProviderLogoProps {
  provider: DiscoveryWatchProvider;
  selected?: boolean;
}

export function WatchProviderLogo({ provider, selected = false }: WatchProviderLogoProps) {
  return (
    <View style={[styles.logoCircle, selected && styles.logoCircleSelected]}>
      <ProviderLogoImage
        name={provider.name}
        logoPath={provider.logoPath}
        size={PROVIDER_LOGO_SIZE}
        imageInset={5}
        testID={`watch-provider-logo-${provider.providerId}`}
      />
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
});
