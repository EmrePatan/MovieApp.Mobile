import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { StreamingProviderTileMark } from '@/features/discovery/components/StreamingProviderTileMark';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { StreamingProviderBrandBackground } from '@/features/discovery/components/StreamingProviderBrandBackground';
import {
  getStreamingProviderBrandGlowShadow,
  getStreamingProviderBrandRing,
  getStreamingProviderBrandTheme,
} from '@/features/discovery/streaming-provider-brand';
import { borderRadius } from '@/theme/spacing';
import { layout } from '@/theme/layout';

const DEFAULT_TILE_WIDTH = layout.posterCarousel.width;
const DEFAULT_TILE_HEIGHT = layout.posterCarousel.height;

export interface StreamingProviderTileSize {
  width: number;
  height: number;
}

export interface StreamingProviderBrandTileProps {
  providerId: number;
  name: string;
  logoPath?: string | null | undefined;
  logoTestID?: string;
  spotlightPosterPath?: string | null;
  spotlightLoading?: boolean;
  tileSize?: StreamingProviderTileSize;
}

export function StreamingProviderBrandTile({
  providerId,
  name,
  logoTestID,
  spotlightPosterPath = null,
  spotlightLoading = false,
  tileSize,
}: StreamingProviderBrandTileProps) {
  const tileWidth = tileSize?.width ?? DEFAULT_TILE_WIDTH;
  const tileHeight = tileSize?.height ?? DEFAULT_TILE_HEIGHT;
  const theme = getStreamingProviderBrandTheme(providerId);
  const glowShadow = getStreamingProviderBrandGlowShadow(providerId);
  const ringColor = getStreamingProviderBrandRing(providerId);
  const hasBackdrop = Boolean(spotlightPosterPath);

  return (
    <View
      style={[
        styles.glowShell,
        {
          width: tileWidth,
          height: tileHeight,
          borderColor: ringColor,
          shadowColor: glowShadow,
          backgroundColor: theme.fill,
        },
      ]}
      accessibilityLabel={name}
    >
      <View style={[styles.frame, { backgroundColor: theme.fill }]}>
        {spotlightLoading ? (
          <SkeletonBlock width={tileWidth} height={tileHeight} />
        ) : (
          <>
            <LinearGradient
              colors={[theme.base[0], theme.base[1], theme.base[2]]}
              locations={[0, 0.45, 1]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {hasBackdrop ? (
              <View style={styles.backdropSlot}>
                <CatalogImage
                  path={spotlightPosterPath}
                  width={tileWidth}
                  height={tileHeight}
                  rounded={false}
                  accessibilityLabel=""
                />
              </View>
            ) : null}

            <View style={styles.brandWash} pointerEvents="none">
              {hasBackdrop ? (
                <>
                  <LinearGradient
                    colors={[theme.glow, theme.mesh, 'transparent']}
                    locations={[0, 0.35, 0.72]}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={styles.colorWash}
                  />
                  <LinearGradient
                    colors={['transparent', theme.backdropBottom]}
                    locations={[0.45, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </>
              ) : (
                <StreamingProviderBrandBackground providerId={providerId} />
              )}
            </View>

            <LinearGradient
              colors={['rgba(0,0,0,0.15)', 'transparent', 'rgba(0,0,0,0.25)']}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            <StreamingProviderTileMark
              providerId={providerId}
              name={name}
              tileWidth={tileWidth}
              testID={logoTestID ?? `streaming-provider-wordmark-${providerId}`}
            />

            <View style={[styles.innerEdge, { borderColor: ringColor }]} pointerEvents="none" />
          </>
        )}
      </View>
    </View>
  );
}

export const STREAMING_PROVIDER_BRAND_TILE_WIDTH = DEFAULT_TILE_WIDTH;

const styles = StyleSheet.create({
  glowShell: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 8,
  },
  frame: {
    flex: 1,
    borderRadius: borderRadius.md - 1,
    overflow: 'hidden',
  },
  backdropSlot: {
    ...StyleSheet.absoluteFill,
    opacity: 0.92,
    transform: [{ scale: 1.15 }],
  },
  brandWash: {
    ...StyleSheet.absoluteFill,
  },
  colorWash: {
    ...StyleSheet.absoluteFill,
    opacity: 0.48,
  },
  innerEdge: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: borderRadius.md - 1,
    opacity: 0.9,
  },
});
