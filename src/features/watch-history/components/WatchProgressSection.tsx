import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { useSeasonProgress } from '../hooks/useSeasonProgress';
import { useTvShowProgress } from '../hooks/useTvShowProgress';
import {
  formatProgressPercentage,
  formatWatchProgressLabel,
} from '../utils/progress-format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface WatchProgressSectionProps {
  tvShowId: string;
  seasonNumber?: number;
}

export function WatchProgressSection({ tvShowId, seasonNumber }: WatchProgressSectionProps) {
  const { isAuthenticated } = useAuth();
  const tvProgress = useTvShowProgress(seasonNumber == null ? tvShowId : '');
  const seasonProgress = useSeasonProgress(
    tvShowId,
    seasonNumber ?? 0,
  );

  const query = seasonNumber == null ? tvProgress : seasonProgress;

  if (!isAuthenticated) {
    return null;
  }

  if (query.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent} size="small" />
      </View>
    );
  }

  if (query.isError || !query.data || query.data.totalEpisodes === 0) {
    return null;
  }

  const progress = query.data;

  return (
    <View style={styles.container} accessibilityRole="summary">
      <AppText variant="subtitle">Watch Progress</AppText>
      <AppText variant="body">
        {formatWatchProgressLabel(progress.watchedEpisodes, progress.totalEpisodes)}
      </AppText>
      <AppText variant="bodySmall" muted>
        {formatProgressPercentage(progress.progressPercentage)}
      </AppText>
      {progress.nextEpisode ? (
        <AppText variant="caption" muted>
          Next:{' '}
          {seasonNumber == null && 'seasonNumber' in progress.nextEpisode
            ? `S${progress.nextEpisode.seasonNumber} E${progress.nextEpisode.episodeNumber}`
            : `E${progress.nextEpisode.episodeNumber}`}
          {progress.nextEpisode.title ? ` · ${progress.nextEpisode.title}` : ''}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
