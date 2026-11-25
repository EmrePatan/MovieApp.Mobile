import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { InsightsCard } from '@/features/insights/components/InsightsCard';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getFamilyHue, type AchievementFamily } from '../achievement-model';
import { useAchievementCopy } from '../useAchievementCopy';
import type { AchievementDetailTarget } from './AchievementDetailSheet';
import { AchievementMedal } from './AchievementMedal';

interface AchievementFamilyCardProps {
  family: AchievementFamily;
  onSelectTier?: (target: AchievementDetailTarget) => void;
}

/** A whole ladder: every tier as a medal (earned ones coloured), current value and progress to the next. */
export function AchievementFamilyCard({ family, onSelectTier }: AchievementFamilyCardProps) {
  const { t, familyName, goal, tierName } = useAchievementCopy();
  const complete = family.next == null;
  const hue = getFamilyHue(family.category);
  const accent = family.topTier > 0 ? hue.light : colors.textMuted;

  return (
    <InsightsCard style={styles.card}>
      <View
        accessible
        accessibilityLabel={t('achievements.a11yFamily', {
          family: familyName(family.category),
          unlocked: family.unlockedCount,
          total: family.tiers.length,
          current: family.currentValue,
        })}
        style={styles.header}
      >
        <View style={styles.headerCopy}>
          <AppText style={styles.name} numberOfLines={1}>
            {familyName(family.category)}
          </AppText>
          <AppText variant="caption" style={styles.goal} numberOfLines={2}>
            {complete ? t('achievements.done') : goal(family.category, family.next?.target ?? 0)}
          </AppText>
        </View>
        <View style={styles.headerRight}>
          <AppText style={[styles.value, { color: accent }]}>
            {family.currentValue.toLocaleString()}
          </AppText>
          <AppText variant="caption" style={styles.tiers}>
            {t('achievements.tiersUnlocked', {
              unlocked: family.unlockedCount,
              total: family.tiers.length,
            })}
          </AppText>
        </View>
      </View>

      <View style={styles.ladder}>
        {family.tiers.map((tier) => {
          const isNext = family.next?.id === tier.id;
          return (
            <Pressable
              key={tier.id}
              style={({ pressed }) => [styles.rung, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`${familyName(family.category)}, ${tierName(tier.tier)}, ${tier.target}`}
              onPress={() =>
                onSelectTier?.({
                  category: family.category,
                  tier,
                  currentValue: family.currentValue,
                })
              }
            >
              <AchievementMedal
                category={family.category}
                tier={tier.tier}
                locked={!tier.achieved}
                progress={isNext ? family.progress : 0}
                size={46}
              />
              <AppText
                variant="caption"
                style={[styles.rungValue, !tier.achieved && styles.rungLocked]}
                numberOfLines={1}
              >
                {tier.target.toLocaleString()}
              </AppText>
              <AppText
                variant="caption"
                style={[styles.rungTier, tier.achieved && { color: hue.light }]}
                numberOfLines={1}
              >
                {tierName(tier.tier)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </InsightsCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  goal: {
    color: colors.textSecondary,
    lineHeight: 16,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  tiers: {
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  ladder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rung: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  rungValue: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  rungLocked: {
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.8,
  },
  rungTier: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
