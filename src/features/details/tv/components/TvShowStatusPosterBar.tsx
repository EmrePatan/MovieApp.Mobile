import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import {
  resolveTvShowStatusKind,
  translateTvShowStatus,
  type TvShowStatusKind,
} from '../utils/tv-show-status';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

interface TvShowStatusPosterBarProps {
  status: string;
}

type StatusBarTheme = {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  textColor: string;
  borderColor: string;
};

const STATUS_BAR_THEMES: Record<TvShowStatusKind, StatusBarTheme> = {
  ended: {
    colors: [
      'rgba(155, 123, 212, 0.28)',
      'rgba(139, 104, 198, 0.78)',
      colors.libraryCompleted,
    ],
    locations: [0, 0.45, 1],
    textColor: '#F5EEFF',
    borderColor: 'rgba(155, 123, 212, 0.42)',
  },
  returningSeries: {
    colors: [colors.accentTint18, 'rgba(196, 163, 90, 0.55)', 'rgba(212, 179, 106, 0.72)'],
    locations: [0, 0.45, 1],
    textColor: '#FFF6E6',
    borderColor: 'rgba(196, 163, 90, 0.38)',
  },
  inProduction: {
    colors: ['rgba(42, 42, 58, 0.9)', 'rgba(107, 159, 212, 0.42)', 'rgba(155, 123, 212, 0.5)'],
    locations: [0, 0.5, 1],
    textColor: '#EEF2FA',
    borderColor: 'rgba(107, 159, 212, 0.32)',
  },
  planned: {
    colors: [colors.surfaceElevated, 'rgba(107, 159, 212, 0.38)', 'rgba(107, 159, 212, 0.58)'],
    locations: [0, 0.55, 1],
    textColor: '#E4EBF6',
    borderColor: 'rgba(107, 159, 212, 0.28)',
  },
  canceled: {
    colors: ['#2E1C22', '#6E2834', colors.dangerMuted],
    locations: [0, 0.48, 1],
    textColor: '#FFE8EA',
    borderColor: 'rgba(229, 9, 20, 0.32)',
  },
  pilot: {
    colors: ['#3A3050', '#6E5A94', '#A088CC'],
    locations: [0, 0.5, 1],
    textColor: '#F2EBFF',
    borderColor: 'rgba(155, 123, 212, 0.35)',
  },
};

export function TvShowStatusPosterBar({ status }: TvShowStatusPosterBarProps) {
  const { t } = useTranslation();
  const label = translateTvShowStatus(status, t);
  const kind = resolveTvShowStatusKind(status);

  if (!label || !kind) {
    return null;
  }

  const theme = STATUS_BAR_THEMES[kind];

  return (
    <View
      style={[styles.outer, { borderColor: theme.borderColor }]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={[...theme.colors]}
        locations={theme.locations ? [...theme.locations] : undefined}
        start={theme.start ?? { x: 0, y: 0.5 }}
        end={theme.end ?? { x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        <AppText variant="caption" style={[styles.label, { color: theme.textColor }]} numberOfLines={2}>
          {label}
        </AppText>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: layout.posterCarousel.width,
    maxWidth: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 18,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
});
