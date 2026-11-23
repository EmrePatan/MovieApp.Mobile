import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { hapticSuccess } from '@/utils/haptics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { InsightsAchievement } from '../types';
import { AchievementMedal } from '@/features/achievements/components/AchievementMedal';
import { useAchievementCopy } from '@/features/achievements/useAchievementCopy';

interface InsightsAchievementCelebrationProps {
  achievements: InsightsAchievement[];
  onClose: () => void;
}

const SPARKS = [
  { top: -6, left: 18, size: 8, delay: 0 },
  { top: 20, right: 8, size: 6, delay: 180 },
  { bottom: 6, left: 4, size: 7, delay: 340 },
  { bottom: -2, right: 26, size: 9, delay: 90 },
  { top: -10, right: 40, size: 5, delay: 260 },
] as const;

function Spark({ delay, size, ...position }: (typeof SPARKS)[number]) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 900 }), withTiming(0.15, { duration: 900 })),
        -1,
      ),
    );
  }, [delay, pulse]);
  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.6 + pulse.value * 0.6 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.spark, position, { width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

/** Gold "milestone unlocked" sheet: badge springs in, sparks pulse, success haptic. */
export function InsightsAchievementCelebration({
  achievements,
  onClose,
}: InsightsAchievementCelebrationProps) {
  useAuthFonts();
  const { t } = useTranslation();
  const { familyName, goal, tierName } = useAchievementCopy();
  const visible = achievements.length > 0;
  const scale = useSharedValue(0.4);
  const featured = achievements[0];

  useEffect(() => {
    if (!visible) {
      scale.value = 0.4;
      return;
    }
    hapticSuccess();
    scale.value = withSpring(1, { damping: 8, stiffness: 120 });
  }, [visible, scale]);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AppBottomSheet visible={visible} onClose={onClose} testID="insights-achievement-celebration">
      {featured ? (
        <View style={styles.body}>
          <View style={styles.stage}>
            {SPARKS.map((spark, index) => (
              <Spark key={index} {...spark} />
            ))}
            <Animated.View style={badgeStyle}>
              <AchievementMedal category={featured.category} tier={featured.tier ?? 1} size={112} />
            </Animated.View>
          </View>

          <AppText variant="caption" style={styles.kicker}>
            {t('insights.celebration.kicker')}
          </AppText>
          <AppText style={styles.title}>
            {t('achievements.celebrationTitle', {
              tier: tierName(featured.tier ?? 1),
              family: familyName(featured.category),
            })}
          </AppText>
          <AppText variant="bodySmall" center style={styles.goal}>
            {goal(featured.category, featured.targetValue)}
          </AppText>
          <AppText variant="bodySmall" center muted>
            {achievements.length > 1
              ? t('insights.celebration.more', { count: achievements.length - 1 })
              : t('insights.celebration.subtitle')}
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('insights.celebration.cta')}
            onPress={onClose}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          >
            <AppText style={styles.ctaText}>{t('insights.celebration.cta')}</AppText>
          </Pressable>
        </View>
      ) : null}
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  stage: {
    width: 150,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goal: {
    color: colors.textSecondary,
  },
  spark: {
    position: 'absolute',
    backgroundColor: colors.accentStrong,
  },
  kicker: {
    color: colors.accentStrong,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  cta: {
    alignSelf: 'stretch',
    height: 48,
    marginTop: spacing.md,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentStrong,
  },
  ctaText: {
    color: colors.background,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
