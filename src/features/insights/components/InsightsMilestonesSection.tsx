import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { t } = useTranslation();

  if (achievements.length === 0) {
    return null;
  }

  const unlockedCount = achievements.filter((achievement) => achievement.achieved).length;
  const hasLocked = unlockedCount < achievements.length;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title={t('insights.milestones.title')}
        subtitle={t('insights.milestones.subtitle')}
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
          <View style={styles.trophyBadge}>
            <Ionicons name="trophy" size={12} color={colors.accentStrong} />
          </View>
          <AppText variant="caption" style={styles.summaryPrimary}>
            {t('insights.milestones.unlockedSummary', {
              unlocked: unlockedCount,
              total: achievements.length,
            })}
          </AppText>
        </View>
        {hasLocked ? (
          <AppText variant="caption" style={styles.summarySecondary}>
            {t('insights.milestones.keepWatching')}
          </AppText>
        ) : null}
      </View>
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={[colors.accentMuted, colors.accentStrong]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
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
  const { t } = useTranslation();
  const accessibilityLabel = achievement.achieved
    ? t('insights.milestones.achievedAccessibility', { title: achievement.title })
    : t('insights.milestones.inProgressAccessibility', {
        title: achievement.title,
        current: achievement.currentValue,
        target: achievement.targetValue,
      });

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
          styles.badgeRing,
          achievement.achieved ? styles.badgeRingUnlocked : styles.badgeRingLocked,
        ]}
      >
        <LinearGradient
          colors={
            achievement.achieved
              ? [colors.accentTint18, colors.surfaceElevated, colors.surface]
              : [colors.surfaceElevated, colors.surface]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badgeCircle}
        >
          <View
            style={[
              styles.iconWell,
              achievement.achieved ? styles.iconWellUnlocked : styles.iconWellLocked,
            ]}
          >
            <Ionicons
              name={iconName}
              size={achievement.achieved ? 24 : 20}
              color={achievement.achieved ? colors.accentStrong : colors.textMuted}
            />
          </View>
        </LinearGradient>
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

const BADGE_SIZE = 68;

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    opacity: 0.96,
    paddingBottom: spacing.sm,
  },
  badgeRow: {
    gap: spacing.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingRight: spacing.sm,
  },
  badgeColumn: {
    width: 80,
    alignItems: 'center',
    gap: 6,
  },
  badgeRing: {
    padding: 2,
    borderRadius: (BADGE_SIZE + 4) / 2,
  },
  badgeRingUnlocked: {
    borderWidth: 1.5,
    borderColor: colors.borderAccent,
  },
  badgeRingLocked: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    opacity: 0.85,
  },
  badgeCircle: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellUnlocked: {
    backgroundColor: colors.accentTint12,
  },
  iconWellLocked: {
    backgroundColor: colors.progressTrack,
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
    gap: spacing.sm,
  },
  trophyBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
  },
  summaryPrimary: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summarySecondary: {
    color: colors.textMuted,
    lineHeight: 16,
    paddingLeft: 30,
  },
  progressTrack: {
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
