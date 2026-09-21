import { memo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { resolveProviderLogoUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface ProviderLogoImageProps {
  name: string;
  logoPath: string | null | undefined;
  size: number;
  imageInset?: number;
  testID?: string;
}

export const ProviderLogoImage = memo(function ProviderLogoImage({
  name,
  logoPath,
  size,
  imageInset = 0,
  testID,
}: ProviderLogoImageProps) {
  const [hasError, setHasError] = useState(false);
  const [trackedPath, setTrackedPath] = useState(logoPath);
  const logoUri = resolveProviderLogoUri(logoPath);
  const imageSize = size - imageInset * 2;
  const showFallback = !logoUri || hasError;

  if (trackedPath !== logoPath) {
    setTrackedPath(logoPath);
    setHasError(false);
  }

  if (showFallback) {
    return (
      <View
        style={[styles.fallback, { width: imageSize, height: imageSize }]}
        testID={testID ? `${testID}-fallback` : undefined}
      >
        <AppText variant="caption" style={styles.fallbackText}>
          {name.charAt(0)}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: logoUri }}
      style={[
        styles.image,
        {
          width: imageSize,
          height: imageSize,
          borderRadius: imageInset > 0 ? borderRadius.md : 0,
        },
      ]}
      resizeMode="contain"
      testID={testID}
      onError={() => setHasError(true)}
    />
  );
});

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'transparent',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  fallbackText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
