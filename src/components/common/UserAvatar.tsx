import { memo, useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { useRemoteImageLoadState } from '@/hooks/useRemoteImageLoadState';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

export function getDisplayInitials(displayName: string, fallback = '?'): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return fallback;
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

interface UserAvatarProps {
  displayName: string;
  effectiveAvatarUrl?: string | null;
  size: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'accent';
  accessibilityLabel?: string;
  initialsFallback?: string;
  textVariant?: 'caption' | 'subtitle';
}

export const UserAvatar = memo(function UserAvatar({
  displayName,
  effectiveAvatarUrl,
  size,
  style,
  variant = 'default',
  accessibilityLabel,
  initialsFallback = '?',
  textVariant = 'caption',
}: UserAvatarProps) {
  const initials = getDisplayInitials(displayName, initialsFallback);
  const resolvedUri = effectiveAvatarUrl?.trim() || null;
  const { hasError, imageKey, onImageError, onImageLoad, onImageLoadEnd } =
    useRemoteImageLoadState(resolvedUri);
  const showImage = Boolean(resolvedUri) && !hasError;
  const [isLoading, setIsLoading] = useState(Boolean(resolvedUri));

  const handleLoad = () => {
    onImageLoad();
    setIsLoading(false);
  };

  const handleError = () => {
    onImageError();
    setIsLoading(false);
  };

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: borderRadius.full },
        variant === 'accent' ? styles.accent : styles.default,
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {showImage ? (
        <Image
          key={imageKey}
          source={{ uri: resolvedUri! }}
          style={[styles.image, { width: size, height: size, borderRadius: borderRadius.full }]}
          resizeMode="cover"
          onLoad={handleLoad}
          onLoadEnd={onImageLoadEnd}
          onError={handleError}
        />
      ) : (
        <AppText
          variant={textVariant}
          style={[styles.initials, variant === 'accent' && styles.initialsAccent]}
        >
          {initials}
        </AppText>
      )}
      {showImage && isLoading ? <View style={styles.loadingOverlay} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.accentTint12,
    borderWidth: 1,
    borderColor: colors.accentTint18,
  },
  image: {},
  initials: {
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  initialsAccent: {
    color: colors.accent,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surfaceElevated,
  },
});
