import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { InsightsAchievement } from '../types';
import { formatAchievedDate } from '../utils/insights-format';
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

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Achievements" subtitle="Milestones from your watching journey" />
      <View style={styles.list}>
        {achievements.map((achievement) => (
          <AchievementRow key={achievement.id} achievement={achievement} />
        ))}
      </View>
    </View>
  );
}

function AchievementRow({ achievement }: { achievement: InsightsAchievement }) {
  const progressPercent = achievement.targetValue > 0
    ? Math.min(100, Math.round((achievement.currentValue / achievement.targetValue) * 100))
    : 0;

  const accessibilityLabel = achievement.achieved
    ? `${achievement.title}, achieved`
    : `${achievement.title}, in progress, ${achievement.currentValue} of ${achievement.targetValue}`;

  return (
    <View
      style={[styles.row, achievement.achieved && styles.rowAchieved]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons
        name={achievement.achieved ? 'ribbon' : 'ribbon-outline'}
        size={15}
        color={achievement.achieved ? colors.progressCompleted : colors.accentMuted}
      />
      <View style={styles.copy}>
        <AppText variant="bodySmall" style={styles.title} numberOfLines={2}>
          {achievement.title}
        </AppText>
        {achievement.achieved ? (
          achievement.achievedAt ? (
            <AppText variant="caption" muted>
              Achieved {formatAchievedDate(achievement.achievedAt)}
            </AppText>
          ) : (
            <AppText variant="caption" muted>Achieved</AppText>
          )
        ) : (
          <>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <AppText variant="caption" muted>
              {achievement.currentValue} / {achievement.targetValue}
            </AppText>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    opacity: 0.96,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  rowAchieved: {
    opacity: 0.9,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '500',
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
