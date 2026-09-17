import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { InsightsMilestone } from '../types';
import { formatAchievedDate } from '../utils/insights-format';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsMilestonesSectionProps {
  milestones: InsightsMilestone[];
}

export function InsightsMilestonesSection({ milestones }: InsightsMilestonesSectionProps) {
  if (milestones.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Milestones" subtitle="Markers from your watching journey" />
      <View style={styles.grid}>
        {milestones.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} />
        ))}
      </View>
    </View>
  );
}

function MilestoneCard({ milestone }: { milestone: InsightsMilestone }) {
  const progressPercent = milestone.targetValue > 0
    ? Math.min(100, Math.round((milestone.currentValue / milestone.targetValue) * 100))
    : 0;

  const accessibilityLabel = milestone.achieved
    ? `${milestone.title}, achieved`
    : `${milestone.title}, in progress, ${milestone.currentValue} of ${milestone.targetValue}`;

  return (
    <View
      style={[styles.card, milestone.achieved && styles.cardAchieved]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.cardHeader}>
        <Ionicons
          name={milestone.achieved ? 'ribbon' : 'ribbon-outline'}
          size={16}
          color={milestone.achieved ? colors.progressCompleted : colors.accent}
        />
        <AppText variant="bodySmall" style={styles.title} numberOfLines={2}>
          {milestone.title}
        </AppText>
      </View>
      {milestone.achieved ? (
        milestone.achievedAt ? (
          <AppText variant="caption" muted>
            Achieved {formatAchievedDate(milestone.achievedAt)}
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
            {milestone.currentValue} / {milestone.targetValue}
          </AppText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    minWidth: 148,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  cardAchieved: {
    borderColor: colors.progressCompletedTint12,
    backgroundColor: colors.progressCompletedTint12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.progressInProgress,
  },
});
