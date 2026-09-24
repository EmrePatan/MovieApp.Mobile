import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import { getStreamingProviderBrandTheme } from '@/features/discovery/streaming-provider-brand';
import { getStreamingProviderTileWordmarkConfig } from '@/features/discovery/streaming-provider-tile-assets';
import {
  getStreamingProviderWordmark,
  getStreamingProviderWordmarkStyle,
} from '@/features/discovery/streaming-provider-wordmark';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface StreamingProviderTileMarkProps {
  providerId: number;
  name: string;
  tileWidth?: number;
  testID?: string;
}

export function StreamingProviderTileMark({
  providerId,
  name,
  tileWidth = layout.posterCarousel.width,
  testID,
}: StreamingProviderTileMarkProps) {
  const markScale = tileWidth / layout.posterCarousel.width;
  const theme = getStreamingProviderBrandTheme(providerId);
  const bundled = getStreamingProviderTileWordmarkConfig(providerId);
  const wordmark = getStreamingProviderWordmark(providerId, name);
  const wordmarkStyle = getStreamingProviderWordmarkStyle(providerId);

  return (
    <View style={styles.bottomDock} pointerEvents="none">
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.55)', theme.backdropBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {bundled ? (
        <Image
          source={bundled.source}
          style={{
            width: bundled.width * markScale,
            height: bundled.height * markScale,
          }}
          resizeMode="contain"
          accessibilityLabel={name}
          testID={testID}
        />
      ) : (
        <AppText
          testID={testID}
          style={[styles.label, wordmarkStyle]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {wordmark}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm + 2,
    paddingTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  label: {
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
