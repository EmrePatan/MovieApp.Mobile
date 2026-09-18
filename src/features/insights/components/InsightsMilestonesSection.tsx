import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { InsightsAchievement } from '../types';
import {
  formatAchievementBadgeNumber,
  formatAchievementCategoryLabel,
  getAchievementIconName,
} from '../utils/insights-format';
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
  const hasLocked = unlockedCount < achievements.length;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Achievements"
        subtitle="Milestones from your watching journey"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgeRow}
        testID="insights-achievements-row"
      >
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </ScrollView>
      <View style={styles.summaryBlock}>
        <View style={styles.summaryRow}>
          <Ionicons name="trophy-outline" size={14} color={colors.accent} />
          <AppText variant="caption" style={styles.summaryPrimary}>
            {unlockedCount} of {achievements.length} unlocked
          </AppText>
        </View>
        {hasLocked ? (
          <AppText variant="caption" style={styles.summarySecondary}>
            Keep watching to unlock your next milestone!
          </AppText>
        ) : null}
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

  const iconName = achievement.achieved
    ? getAchievementIconName(achievement.category)
    : 'lock-closed-outline';

  return (
    <View
      style={styles.badgeColumn}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <View
        style={[
          styles.badgeCircle,
          achievement.achieved ? styles.badgeCircleUnlocked : styles.badgeCircleLocked,
        ]}
      >
        <Ionicons
          name={iconName}
          size={22}
          color={achievement.achieved ? colors.background : colors.textMuted}
        />
      </View>
      <AppText
        variant="bodySmall"
        style={[styles.badgeNumber, !achievement.achieved && styles.badgeTextLocked]}
      >
        {formatAchievementBadgeNumber(achievement.targetValue)}
      </AppText>
      <AppText
        variant="caption"
        style={[styles.badgeLabel, !achievement.achieved && styles.badgeTextLocked]}
        numberOfLines={2}
      >
        {formatAchievementCategoryLabel(achievement.category)}
      </AppText>
    </View>
  );
}

const BADGE_SIZE = 64;

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    opacity: 0.96,
    paddingBottom: spacing.sm,
  },
  badgeRow: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  badgeColumn: {
    width: 76,
    alignItems: 'center',
    gap: 6,
  },
  badgeCircle: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCircleUnlocked: {
    backgroundColor: colors.accent,
  },
  badgeCircleLocked: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    opacity: 0.9,
  },
  badgeNumber: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  badgeLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
  },
  badgeTextLocked: {
    color: colors.textMuted,
  },
  summaryBlock: {
    gap: 4,
    paddingTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryPrimary: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summarySecondary: {
    color: colors.textMuted,
    lineHeight: 16,
    paddingLeft: 22,
  },
  progressTrack: {
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
});
