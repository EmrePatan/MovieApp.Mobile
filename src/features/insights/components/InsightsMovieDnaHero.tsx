import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import type { InsightsMovieDnaLabel, InsightsSummaryStats } from '../types';
import { formatAverageStarRating } from '../utils/insights-format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsMovieDnaHeroProps {
  labels: InsightsMovieDnaLabel[];
  summary: InsightsSummaryStats;
}

export function InsightsMovieDnaHero({ labels, summary }: InsightsMovieDnaHeroProps) {
  const visibleLabels = labels.slice(0, 3);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(196, 163, 90, 0.16)', 'rgba(20, 20, 28, 0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <AppText variant="caption" muted style={styles.kicker}>
          Movie DNA
        </AppText>
        <AppText variant="title" style={styles.headline}>
          Your movie life, in focus
        </AppText>

        {visibleLabels.length > 0 ? (
          <View style={styles.labels}>
            {visibleLabels.map((label) => (
              <View
                key={label.code}
                style={styles.labelChip}
                accessibilityRole="text"
                accessibilityLabel={`${label.category}: ${label.label}`}
              >
                <AppText variant="caption" muted style={styles.labelCategory}>
                  {label.category}
                </AppText>
                <AppText variant="bodySmall" style={styles.labelText}>
                  {label.label}
                </AppText>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={styles.discoveryState}
            accessibilityRole="text"
            accessibilityLabel="Still discovering your taste"
          >
            <AppText variant="bodySmall" muted>
              Still discovering your taste. Keep watching and rating to shape your Movie DNA.
            </AppText>
          </View>
        )}

        <View style={styles.statsRow} accessibilityRole="text">
          <StatItem label="Movies" value={String(summary.moviesWatched)} />
          <StatDivider />
          <StatItem label="Episodes" value={String(summary.episodesWatched)} />
          <StatDivider />
          <StatItem label="Shows" value={String(summary.showsStarted)} />
          <StatDivider />
          <StatItem
            label="Ratings"
            value={
              summary.ratingsCount > 0
                ? `${summary.ratingsCount} · ${formatAverageStarRating(summary.averageStarRating)}★`
                : '0'
            }
          />
        </View>
      </LinearGradient>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="bodySmall" style={styles.statValue}>
        {value}
      </AppText>
    </View>
  );
}

function StatDivider() {
  return <View style={styles.statDivider} />;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
  },
  gradient: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headline: {
    color: colors.textPrimary,
  },
  labels: {
    gap: spacing.sm,
  },
  labelChip: {
    gap: 2,
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  labelCategory: {
    textTransform: 'capitalize',
  },
  labelText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  discoveryState: {
    paddingVertical: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  statItem: {
    flex: 1,
    gap: 2,
  },
  statValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.borderSubtle,
  },
});
