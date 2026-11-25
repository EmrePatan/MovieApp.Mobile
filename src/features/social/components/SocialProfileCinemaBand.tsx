import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const POSTER_BLUR_RADIUS = 32;
const SCRIM = ['rgba(6,6,10,0.35)', 'rgba(6,6,10,0.88)'] as const;
const ACCENT_GLOW = ['transparent', 'rgba(196, 163, 90, 0.22)'] as const;
const TOP_STRIPE = ['transparent', colors.accentMuted, 'transparent'] as const;
const FALLBACK_GRADIENT = ['#1a1520', colors.background] as const;

interface SocialProfileCinemaBandProps {
  posterPath: string | null | undefined;
  children: ReactNode;
}

export function SocialProfileCinemaBand({ posterPath, children }: SocialProfileCinemaBandProps) {
  const posterUri = resolveImageUri(posterPath, 'w780');

  return (
    <View style={styles.wrap}>
      {posterUri ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image
            source={{ uri: posterUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={POSTER_BLUR_RADIUS}
            cachePolicy="memory-disk"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </View>
      ) : (
        <LinearGradient colors={[...FALLBACK_GRADIENT]} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient pointerEvents="none" colors={[...SCRIM]} style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={[...ACCENT_GLOW]} style={styles.accentGlow} />
      <LinearGradient
        pointerEvents="none"
        colors={[...TOP_STRIPE]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.topStripe}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderAccent,
  },
  accentGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  topStripe: {
    position: 'absolute',
    top: 0,
    left: layout.screenPaddingHorizontal,
    right: layout.screenPaddingHorizontal,
    height: 1,
    opacity: 0.85,
  },
  content: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});