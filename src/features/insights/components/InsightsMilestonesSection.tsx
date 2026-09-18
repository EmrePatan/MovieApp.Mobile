import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { InsightsAchievement } from '../types';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsMilestonesSectionProps {
  achievements: InsightsAchievement[];
}

export function InsightsMilestonesSection({ achievements }: InsightsMilestonesSectionProps) {
  if (achievements.length === 0) {
    return null;
  }

  const unlockedCount = achievements.filter((achievement) => achievement.achieved).length;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Achievements"
        subtitle="Milestones from your watching journey"
      />
      <View style={styles.badgeRow}>
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </View>
      <View style={styles.summaryRow}>
        <Ionicons name="trophy-outline" size={14} color={colors.accentMuted} />
        <AppText variant="caption" muted>
          {unlockedCount} of {achievements.length} unlocked
        </AppText>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round((unlockedCount / achievements.length) * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

function AchievementBadge({ achievement }: { achievement: InsightsAchievement }) {
  const accessibilityLabel = achievement.achieved
    ? `${achievement.title}, achieved`
    : `${achievement.title}, in progress, ${achievement.currentValue} of ${achievement.targetValue}`;

  return (
    <View
      style={[styles.badge, achievement.achieved ? styles.badgeUnlocked : styles.badgeLocked]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons
        name={achievement.achieved ? 'ribbon' : 'lock-closed-outline'}
        size={18}
        color={achievement.achieved ? colors.accent : colors.textMuted}
      />
      <AppText
        variant="caption"
        style={[styles.badgeTitle, !achievement.achieved && styles.badgeTitleLocked]}
        numberOfLines={2}
      >
        {achievement.title}
      </AppText>
      {!achievement.achieved ? (
        <AppText variant="caption" muted style={styles.badgeProgress}>
          {achievement.currentValue}/{achievement.targetValue}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    opacity: 0.92,
    paddingBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    width: 92,
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeUnlocked: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint12,
  },
  badgeLocked: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    opacity: 0.85,
  },
  badgeTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
  badgeTitleLocked: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  badgeProgress: {
    fontVariant: ['tabular-nums'],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  progressTrack: {
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentMuted,
  },
});
