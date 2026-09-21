import { memo, useCallback, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { resolveImageUri, type ImageSize } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

const PROVIDER_LOGO_SIZES: ImageSize[] = ['w92', 'w500'];

type ProviderLogoLoadState = {
  sizeIndex: number;
  retryVersion: number;
  hasError: boolean;
};

const INITIAL_LOAD_STATE: ProviderLogoLoadState = {
  sizeIndex: 0,
  retryVersion: 0,
  hasError: false,
};

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
  const [trackedLogoPath, setTrackedLogoPath] = useState(logoPath);
  const [loadState, setLoadState] = useState<ProviderLogoLoadState>(INITIAL_LOAD_STATE);
  const logoSize = PROVIDER_LOGO_SIZES[loadState.sizeIndex];
  const logoUri = resolveImageUri(logoPath, logoSize);
  const imageSize = size - imageInset * 2;
  const showFallback = !logoUri || loadState.hasError;
  const imageKey = `${logoPath ?? ''}:${loadState.sizeIndex}:${loadState.retryVersion}`;

  if (trackedLogoPath !== logoPath) {
    setTrackedLogoPath(logoPath);
    setLoadState(INITIAL_LOAD_STATE);
  }

  const handleImageError = useCallback(() => {
    setLoadState((current) => {
      if (current.sizeIndex < PROVIDER_LOGO_SIZES.length - 1) {
        return {
          sizeIndex: current.sizeIndex + 1,
          retryVersion: 0,
          hasError: false,
        };
      }

      if (current.retryVersion < 1) {
        return { ...current, retryVersion: current.retryVersion + 1 };
      }

      return { ...current, hasError: true };
    });
  }, []);

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
      key={imageKey}
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
      onError={handleImageError}
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
