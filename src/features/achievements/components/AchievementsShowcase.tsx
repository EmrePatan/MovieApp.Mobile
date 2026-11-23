import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { rememberAppShellTabOrigin } from '@/features/navigation/app-shell-tab-origin';
import { InsightsCard } from '@/features/insights/components/InsightsCard';
import { InsightsSectionHeader } from '@/features/insights/components/InsightsSectionHeader';
import type { InsightsAchievement } from '@/features/insights/types';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';
import {
  computeLevel,
  groupAchievements,
  nextUp,
  recentUnlocks,
  totalPoints,
} from '../achievement-model';
import { useAchievementCopy } from '../useAchievementCopy';
import { AchievementDetailSheet, type AchievementDetailTarget } from './AchievementDetailSheet';
import { AchievementLevelCard } from './AchievementLevelCard';
import { AchievementMedal } from './AchievementMedal';
import { AchievementNextUpRow } from './AchievementNextUpRow';

interface AchievementsShowcaseProps {
  achievements: InsightsAchievement[];
}

/** Insights section: level, the three closest goals, latest unlocks and a way into the full list. */
export function AchievementsShowcase({ achievements }: AchievementsShowcaseProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<AchievementDetailTarget | null>(null);
  const { t, familyName, tierName } = useAchievementCopy();
  const model = useMemo(() => {
    const families = groupAchievements(achievements);
    return {
      level: computeLevel(totalPoints(families)),
      next: nextUp(families, 3),
      recent: recentUnlocks(families, 8),
      unlocked: families.reduce((sum, family) => sum + family.unlockedCount, 0),
      total: families.reduce((sum, family) => sum + family.tiers.length, 0),
    };
  }, [achievements]);

  if (achievements.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} testID="insights-achievements-row">
      <InsightsSectionHeader
        title={t('achievements.title')}
        subtitle={t('achievements.subtitle')}
        index={6}
      />
      <InsightsCard glow style={styles.card}>
        <AchievementLevelCard level={model.level} />

        {model.next.length > 0 ? (
          <View style={styles.block}>
            <AppText variant="caption" style={styles.blockTitle}>
              {t('achievements.nextUp')}
            </AppText>
            {model.next.map((family) => (
              <AchievementNextUpRow key={family.category} family={family} />
            ))}
          </View>
        ) : null}

        {model.recent.length > 0 ? (
          <View style={styles.block}>
            <AppText variant="caption" style={styles.blockTitle}>
              {t('achievements.recent')}
            </AppText>
            <View style={styles.recentRow}>
              {model.recent.slice(0, 5).map(({ category, tier }) => (
                <Pressable
                  key={tier.id}
                  style={({ pressed }) => [styles.recentItem, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`${familyName(category)}, ${tierName(tier.tier)}`}
                  onPress={() => setDetail({ category, tier })}
                  testID={`achievement-recent-${tier.id}`}
                >
                  <AchievementMedal category={category} tier={tier.tier} size={44} />
                  <AppText variant="caption" style={styles.recentLabel} numberOfLines={1}>
                    {tier.target.toLocaleString()}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('achievements.allAchievements')}
          onPress={() => {
            rememberAppShellTabOrigin('/insights');
            router.push('/achievements');
          }}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          testID="achievements-view-all"
        >
          <AppText style={styles.ctaText}>
            {`${t('achievements.viewAll')} · ${model.unlocked}/${model.total}`}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.accentStrong} />
        </Pressable>
      </InsightsCard>
      <AchievementDetailSheet target={detail} onClose={() => setDetail(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  card: {
    gap: spacing.lg,
  },
  block: {
    gap: spacing.md,
  },
  blockTitle: {
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  recentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  recentItem: {
    alignItems: 'center',
    gap: 4,
  },
  recentLabel: {
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 22,
    backgroundColor: glass.accentFill,
    borderWidth: 1,
    borderColor: glass.accentBorder,
  },
  ctaText: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
});
