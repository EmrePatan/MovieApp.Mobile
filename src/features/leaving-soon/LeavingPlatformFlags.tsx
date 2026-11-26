import { StyleSheet, View } from 'react-native';
import { ProviderLogoImage } from '@/components/common/ProviderLogoImage';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { borderRadius, spacing } from '@/theme/spacing';
import { findLeavingPlatformLogoPath } from './leaving-platform-logos';
import type { LeavingSoonPlatform } from './leaving-soon-types';

const FLAG_SIZE = 24;

interface LeavingPlatformFlagsProps {
  platforms: readonly Pick<LeavingSoonPlatform, 'serviceId' | 'name'>[];
}

/** Small logo badges for a poster. Without a logo the badge shows the first letter. */
export function LeavingPlatformFlags({ platforms }: LeavingPlatformFlagsProps) {
  const { region, isHydrated } = useRegionalPreference();
  // Cards share one cached request per region.
  const movieProviders = useDiscoveryWatchProviders('movie', region, isHydrated);
  const providers = movieProviders.data?.providers ?? [];

  return (
    <View style={styles.row}>
      {platforms.map((platform) => (
        <View key={platform.serviceId} style={styles.flag}>
          <ProviderLogoImage
            name={platform.name}
            logoPath={findLeavingPlatformLogoPath(platform.serviceId, providers)}
            size={FLAG_SIZE}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  flag: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
});
