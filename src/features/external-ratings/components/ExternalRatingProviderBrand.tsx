import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { resolveExternalRatingProviderBrandConfig } from '../config/external-rating-provider-brand-config';

interface ExternalRatingProviderBrandProps {
  source: string;
  variant?: 'default' | 'compact' | 'card';
}

export function ExternalRatingProviderBrand({
  source,
  variant = 'default',
}: ExternalRatingProviderBrandProps) {
  const config = resolveExternalRatingProviderBrandConfig(source, variant);

  if (!config) {
    return <AppText style={styles.fallbackLabel}>{source}</AppText>;
  }

  if (config.kind === 'rotten-tomatoes-icons') {
    return (
      <View
        style={styles.rtIconRow}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <Image
          source={config.tomatometerIcon}
          style={{ width: config.iconSize, height: config.iconSize }}
          resizeMode="contain"
          fadeDuration={0}
          accessibilityLabel="Tomatometer"
          testID="rt-tomatometer-icon"
        />
        <Image
          source={config.popcornIcon}
          style={{ width: config.iconSize, height: config.iconSize }}
          resizeMode="contain"
          fadeDuration={0}
          accessibilityLabel="Popcornmeter"
          testID="rt-popcorn-icon"
        />
      </View>
    );
  }

  const imageStyle = {
    width: config.height * config.aspectRatio,
    height: config.height,
  };

  const image = (
    <Image
      source={config.source}
      style={imageStyle}
      resizeMode="contain"
      fadeDuration={0}
      accessibilityLabel={config.accessibilityLabel}
      testID={`external-rating-brand-${source}`}
    />
  );

  return (
    <View
      style={[styles.brandRow, variant === 'compact' && styles.brandRowCompact]}
      accessibilityElementsHidden
      importantForAccessibility="no"
      accessibilityLabel={config.accessibilityLabel}
    >
      {config.surface === 'light' ? (
        <View style={styles.lightSurface}>{image}</View>
      ) : (
        image
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
  lightSurface: {
    backgroundColor: '#F0F0F2',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  rtIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fallbackLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
