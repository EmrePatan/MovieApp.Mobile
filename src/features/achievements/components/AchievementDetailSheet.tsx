import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';
import { TIER_POINTS, type AchievementTier } from '../achievement-model';
import { useAchievementCopy } from '../useAchievementCopy';
import { AchievementMedal } from './AchievementMedal';

export interface AchievementDetailTarget {
  category: string;
  tier: AchievementTier;
  /** Current value of the family, used for the progress line of locked tiers. */
  currentValue?: number;
}

interface AchievementDetailSheetProps {
  target: AchievementDetailTarget | null;
  onClose: () => void;
}

/** What a single achievement is, what it takes, what it is worth and when it was earned. */
export function AchievementDetailSheet({ target, onClose }: AchievementDetailSheetProps) {
  useAuthFonts();
  const { i18n } = useTranslation();
  const { t, familyName, goal, tierName } = useAchievementCopy();
  const tier = target?.tier;
  const achieved = tier?.achieved ?? false;
  const points = tier ? (TIER_POINTS[tier.tier - 1] ?? 1) : 0;
  const remaining =
    tier && target?.currentValue != null ? Math.max(0, tier.target - target.currentValue) : null;
  const date =
    tier?.achievedAt != null
      ? new Date(tier.achievedAt).toLocaleDateString(i18n.language, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

  return (
    <AppBottomSheet visible={target != null} onClose={onClose} testID="achievement-detail-sheet">
      {target && tier ? (
        <View style={styles.body}>
          <AchievementMedal
            category={target.category}
            tier={tier.tier}
            locked={!achieved}
            size={96}
          />
          <AppText variant="caption" style={styles.kicker}>
            {tierName(tier.tier)}
          </AppText>
          <AppText style={styles.title}>{familyName(target.category)}</AppText>
          <AppText variant="bodySmall" center style={styles.goal}>
            {goal(target.category, tier.target)}
          </AppText>

          <View style={styles.chips}>
            <View style={styles.chip}>
              <AppText variant="caption" style={styles.chipText}>
                {t('achievements.points', { points })}
              </AppText>
            </View>
            {achieved && date ? (
              <View style={styles.chip}>
                <AppText variant="caption" style={styles.chipText}>
                  {t('achievements.unlockedOn', { date })}
                </AppText>
              </View>
            ) : null}
            {!achieved && remaining != null ? (
              <View style={styles.chip}>
                <AppText variant="caption" style={styles.chipText}>
                  {`${(target.currentValue ?? 0).toLocaleString()} / ${tier.target.toLocaleString()} · ${t(
                    'achievements.toGo',
                    { count: remaining.toLocaleString() },
                  )}`}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  kicker: {
    marginTop: spacing.sm,
    color: colors.accentStrong,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  goal: {
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: glass.accentFill,
    borderWidth: 1,
    borderColor: glass.accentBorder,
  },
  chipText: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
});
