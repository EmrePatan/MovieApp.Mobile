import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { HOME_HEADER_COMPACT_TARGET } from './home-header-styles';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface HomeBrandMarkProps {
  overlay?: boolean;
}

interface CaveBackdropProps {
  overlay: boolean;
  children: ReactNode;
}

const CAVE_VERTICAL_COLORS = [
  '#0C0A10',
  '#141018',
  '#1E1812',
  '#2E261A',
  '#4A3C28',
  '#6E5A38',
  '#9A8048',
  '#B89552',
  '#C4A35A',
  '#D4B36A',
  '#C4A35A',
  '#B89552',
  '#9A8048',
  '#6E5A38',
  '#4A3C28',
  '#2E261A',
  '#1E1812',
  '#141018',
  '#0C0A10',
] as const;

const CAVE_VERTICAL_LOCATIONS = [
  0, 0.06, 0.12, 0.2, 0.28, 0.36, 0.42, 0.46, 0.49, 0.5, 0.51, 0.54, 0.58, 0.64, 0.72, 0.8, 0.88, 0.94, 1,
] as const;

function CaveBackdrop({ overlay, children }: CaveBackdropProps) {
  return (
    <View style={[styles.caveShell, overlay && styles.caveShellOverlay]}>
      <LinearGradient
        colors={
          overlay
            ? [
                'rgba(12, 10, 16, 0.9)',
                'rgba(48, 38, 24, 0.82)',
                'rgba(120, 98, 60, 0.78)',
                'rgba(196, 163, 90, 0.68)',
                'rgba(120, 98, 60, 0.78)',
                'rgba(48, 38, 24, 0.82)',
                'rgba(12, 10, 16, 0.9)',
              ]
            : [...CAVE_VERTICAL_COLORS]
        }
        locations={
          overlay ? [0, 0.18, 0.34, 0.5, 0.66, 0.82, 1] : [...CAVE_VERTICAL_LOCATIONS]
        }
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.48)',
          'rgba(0, 0, 0, 0.18)',
          'transparent',
          'transparent',
          'rgba(0, 0, 0, 0.18)',
          'rgba(0, 0, 0, 0.48)',
        ]}
        locations={[0, 0.14, 0.32, 0.68, 0.86, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['transparent', 'rgba(255, 232, 170, 0.16)', 'rgba(255, 232, 170, 0.22)', 'rgba(255, 232, 170, 0.16)', 'transparent']}
        locations={[0, 0.28, 0.5, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.centerBloom}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.14)', 'rgba(0, 0, 0, 0.24)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.floorShadow}
        pointerEvents="none"
      />

      <View style={styles.archRim} pointerEvents="none" />

      <View style={styles.labelRow}>{children}</View>
    </View>
  );
}

export function HomeBrandMark({ overlay = false }: HomeBrandMarkProps) {
  const { t } = useTranslation();
  const caveSize = overlay ? 15 : 22;
  const leadSize = overlay ? 9 : 11;
  const lineHeight = overlay ? 18 : 24;

  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel={t('home.brandMark')}>
      <CaveBackdrop overlay={overlay}>
        <Text
          style={[
            styles.lead,
            { fontSize: leadSize, lineHeight },
            overlay && styles.leadOverlay,
          ]}
        >
          movie
        </Text>
        <Text
          style={[
            styles.cave,
            { fontSize: caveSize, lineHeight },
            overlay && styles.caveOverlay,
          ]}
        >
          Cave
        </Text>
      </CaveBackdrop>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  caveShell: {
    overflow: 'hidden',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: spacing.lg,
    minWidth: 118,
    height: HOME_HEADER_COMPACT_TARGET + 4,
    justifyContent: 'center',
  },
  caveShellOverlay: {
    borderColor: 'rgba(196, 163, 90, 0.5)',
  },
  centerBloom: {
    position: 'absolute',
    top: '12%',
    bottom: '12%',
    left: 0,
    right: 0,
  },
  archRim: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
    right: spacing.md,
    height: 1,
    backgroundColor: 'rgba(255, 236, 190, 0.22)',
  },
  floorShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    zIndex: 1,
  },
  lead: {
    color: 'rgba(255, 248, 235, 0.88)',
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'lowercase',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  leadOverlay: {
    color: 'rgba(255, 248, 235, 0.92)',
  },
  cave: {
    color: '#FFF9EE',
    fontWeight: '800',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(62, 44, 18, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caveOverlay: {
    color: '#FFFDF8',
  },
});
