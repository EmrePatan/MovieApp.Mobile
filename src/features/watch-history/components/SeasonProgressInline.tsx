import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { useSeasonProgress } from '../hooks/useSeasonProgress';
import { SeasonProgressBar } from './SeasonProgressBar';
import {
  formatSeasonProgressCount,
  getSeasonProgressState,
  normalizeProgressCounts,
} from '../utils/season-progress';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SeasonProgressInlineProps {
  tvShowId: string;
  seasonNumber: number;
  fallbackTotalEpisodes?: number | null;
}

export function SeasonProgressInline({
  tvShowId,
  seasonNumber,
  fallbackTotalEpisodes = null,
}: SeasonProgressInlineProps) {
  const { isAuthenticated } = useAuth();
  const progressQuery = useSeasonProgress(tvShowId, seasonNumber);

  if (!isAuthenticated) {
    return null;
  }

  const totalEpisodes =
    progressQuery.data?.totalEpisodes ?? Math.max(0, fallbackTotalEpisodes ?? 0);
  const watchedEpisodes = progressQuery.data?.watchedEpisodes ?? 0;

  if (totalEpisodes === 0) {
    return null;
  }

  const { watchedEpisodes: watched, totalEpisodes: total } = normalizeProgressCounts(
    watchedEpisodes,
    totalEpisodes,
  );
  const state = getSeasonProgressState(watched, total);
  const countLabel = formatSeasonProgressCount(watched, total);

  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={`Season progress ${countLabel}`}
      testID="season-progress-inline"
    >
      <View style={styles.summaryRow}>
        <AppText variant="caption" muted>
          Progress
        </AppText>
        <View style={styles.countRow}>
          <AppText variant="caption" style={styles.countLabel}>
            {countLabel}
          </AppText>
          {state === 'completed' ? (
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.progressCompleted}
              accessibilityLabel="Season completed"
            />
          ) : null}
        </View>
      </View>
      <SeasonProgressBar watchedEpisodes={watched} totalEpisodes={total} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
