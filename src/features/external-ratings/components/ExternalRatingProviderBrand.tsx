import { Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { EXTERNAL_RATING_BRAND_SVGS } from '../config/external-rating-brand-svgs';
import { resolveExternalRatingProviderBrandConfig } from '../config/external-rating-provider-brand-config';
import { resolveRenderableBrandSvg } from '../utils/brand-svg';

interface ExternalRatingProviderBrandProps {
  source: string;
}

function SvgProviderBrand({
  xml,
  height,
  aspectRatio,
  fallbackLabel,
}: {
  xml: string;
  height: number;
  aspectRatio: number;
  fallbackLabel: string;
}) {
  const renderableXml = resolveRenderableBrandSvg(xml);
  if (!renderableXml) {
    return <AppText style={styles.fallbackLabel}>{fallbackLabel}</AppText>;
  }

  const width = height * aspectRatio;

  return (
    <SvgXml
      xml={renderableXml}
      width={width}
      height={height}
      accessibilityRole="image"
    />
  );
}

export function ExternalRatingProviderBrand({ source }: ExternalRatingProviderBrandProps) {
  const config = resolveExternalRatingProviderBrandConfig(source);

  if (!config) {
    return <AppText style={styles.fallbackLabel}>{source}</AppText>;
  }

  return (
    <View
      style={styles.brandRow}
      accessibilityElementsHidden
      importantForAccessibility="no"
      accessibilityLabel={config.accessibilityLabel}
    >
      {config.kind === 'svg' ? (
        <SvgProviderBrand
          xml={EXTERNAL_RATING_BRAND_SVGS[config.svgKey]}
          height={config.height}
          aspectRatio={config.aspectRatio}
          fallbackLabel={config.accessibilityLabel}
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
  rtIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rtIcon: {
    width: 20,
    height: 20,
  },
  fallbackLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
