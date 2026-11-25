import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AppText } from '@/components/common/AppText';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { AchievementLevel } from '../achievement-model';
import { useAchievementCopy } from '../useAchievementCopy';

const SIZE = 84;
const STROKE = 6;

interface AchievementLevelCardProps {
  level: AchievementLevel;
}

/** Level ring + name + "points to next level": the headline of the whole achievements system. */
export function AchievementLevelCard({ level }: AchievementLevelCardProps) {
  useAuthFonts();
  const { t, levelName } = useAchievementCopy();
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const nextName = level.ceiling == null ? null : levelName(level.level + 1);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${t('achievements.level', { level: level.level })}, ${levelName(level.level)}, ${t('achievements.points', { points: level.points })}`}
    >
      <View style={styles.ringWrap}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="levelRing" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#F6E2A8" />
              <Stop offset="1" stopColor="#B8923A" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            stroke="url(#levelRing)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - level.progress)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <AppText style={styles.levelNumber}>{level.level}</AppText>
        </View>
      </View>
      <View style={styles.copy}>
        <AppText variant="caption" style={styles.kicker}>
          {t('achievements.level', { level: level.level })}
        </AppText>
        <AppText style={styles.levelName} numberOfLines={1}>
          {levelName(level.level)}
        </AppText>
        <AppText variant="caption" style={styles.points}>
          {nextName
            ? t('achievements.pointsToNext', { points: level.pointsToNext, name: nextName })
            : t('achievements.maxLevel')}
        </AppText>
        <AppText variant="caption" style={styles.total}>
          {t('achievements.points', { points: level.points })}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
    includeFontPadding: false,
    color: colors.accentStrong,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  levelName: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  points: {
    color: colors.textSecondary,
    lineHeight: 16,
  },
  total: {
    color: colors.accentMuted,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
