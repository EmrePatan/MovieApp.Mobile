import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { resolveExternalRatingProviderBrandConfig } from '../config/external-rating-provider-brand-config';

interface ExternalRatingProviderBrandProps {
  source: string;
  variant?: 'default' | 'compact';
}

export function ExternalRatingProviderBrand({
  source,
  variant = 'default',
}: ExternalRatingProviderBrandProps) {
  const config = resolveExternalRatingProviderBrandConfig(source, variant);

  if (!config) {
    return <AppText style={styles.fallbackLabel}>{source}</AppText>;
  }

  const compact = variant === 'compact';

  return (
    <View
      style={[styles.brandRow, compact && styles.brandRowCompact]}
      accessibilityElementsHidden
      importantForAccessibility="no"
      accessibilityLabel={config.accessibilityLabel}
    >
      {config.kind === 'image' ? (
        <Image
          source={config.source}
          style={{
            width: config.height * config.aspectRatio,
            height: config.height,
          }}
          resizeMode="contain"
          accessibilityLabel={config.accessibilityLabel}
          testID={`external-rating-brand-${source}`}
        />
      ) : (
        <View style={styles.rtIconRow}>
          <Image
            source={config.tomatometerIcon}
            style={[styles.rtIcon, { width: config.iconSize, height: config.iconSize }]}
            resizeMode="contain"
            accessibilityLabel="Tomatometer"
            testID="rt-tomatometer-icon"
          />
          <Image
            source={config.popcornIcon}
            style={[styles.rtIcon, { width: config.iconSize, height: config.iconSize }]}
            resizeMode="contain"
            accessibilityLabel="Popcornmeter"
            testID="rt-popcorn-icon"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    minHeight: 22,
    justifyContent: 'center',
  },
  brandRowCompact: {
    minHeight: 16,
  },
  rtIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rtIcon: {
    width: 20,
    height: 20,
  },
  fallbackLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
