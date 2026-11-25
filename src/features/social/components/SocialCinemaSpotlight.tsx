import { memo, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const POSTER_BLUR_RADIUS = 28;
const SCRIM = ['rgba(6,6,10,0.2)', 'rgba(6,6,10,0.55)', 'rgba(6,6,10,0.93)'] as const;
const ACCENT_GLOW = ['transparent', 'rgba(196, 163, 90, 0.28)'] as const;
const VIGNETTE_SIDE = ['rgba(0,0,0,0.55)', 'transparent'] as const;
const FALLBACK_GRADIENT = ['#1a1520', colors.background] as const;
const TOP_STRIPE = ['transparent', colors.accentMuted, 'transparent'] as const;

interface SocialCinemaSpotlightProps {
  posterPath: string | null | undefined;
  onPress?: () => void;
  accessibilityLabel?: string;
  compact?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}

export const SocialCinemaSpotlight = memo(function SocialCinemaSpotlight({
  posterPath,
  onPress,
  accessibilityLabel,
  compact = false,
  footer,
  children,
}: SocialCinemaSpotlightProps) {
  const posterUri = resolveImageUri(posterPath, 'w780');

  const inner = (
    <>
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
      <LinearGradient
        pointerEvents="none"
        colors={[...SCRIM]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[...VIGNETTE_SIDE]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.vignetteLeft}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', ...VIGNETTE_SIDE]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.vignetteRight}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[...ACCENT_GLOW]}
        style={styles.accentGlow}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[...TOP_STRIPE]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.topStripe}
      />
      <View style={[styles.content, compact && styles.contentCompact]}>
        {children}
        {footer ? <View style={styles.footerSlot}>{footer}</View> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.shell,
          compact && styles.shellCompact,
          pressed && styles.pressed,
        ]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={[styles.shell, compact && styles.shellCompact]}>{inner}</View>;
});

const styles = StyleSheet.create({
  shell: {
    borderRadius: borderRadius.lg + 2,
    overflow: 'hidden',
    minHeight: 228,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
    backgroundColor: glass.panel,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOpacity: 0.22,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shellCompact: {
    minHeight: 188,
  },
  vignetteLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '35%',
  },
  vignetteRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '35%',
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
    left: spacing.lg,
    right: spacing.lg,
    height: 2,
    opacity: 0.85,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  contentCompact: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  footerSlot: {
    marginTop: spacing.xs,
    marginHorizontal: -spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
    transform: [{ scale: 0.985 }],
  },
});