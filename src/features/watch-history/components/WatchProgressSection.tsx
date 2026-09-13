import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';

import { useAuth } from '@/auth/useAuth';

import { useSeasonProgress } from '../hooks/useSeasonProgress';

import { useTvShowProgress } from '../hooks/useTvShowProgress';

import {

  clampProgressPercentage,

  formatNextEpisodeLine,

  formatProgressPercentDisplay,

  formatWatchProgressEpisodeSummary,

  getWatchProgressCompletionLabel,

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

  const seasonProgress = useSeasonProgress(tvShowId, seasonNumber ?? 0);



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

  const progressPercent = clampProgressPercentage(progress.progressPercentage);

  const includeSeasonNumber = seasonNumber == null;

  const nextEpisodeLine = progress.nextEpisode

    ? formatNextEpisodeLine(progress.nextEpisode, includeSeasonNumber)

    : null;

  const completionLabel = getWatchProgressCompletionLabel(

    progress.watchedEpisodes,

    progress.totalEpisodes,

    progress.nextEpisode != null,

  );



  return (

    <View

      style={styles.container}

      accessibilityRole="summary"

      accessibilityLabel={[

        'Watch progress',

        formatWatchProgressEpisodeSummary(progress.watchedEpisodes, progress.totalEpisodes),

        formatProgressPercentDisplay(progressPercent),

        nextEpisodeLine ? `Next episode ${nextEpisodeLine}` : completionLabel,

      ]

        .filter(Boolean)

        .join(', ')}

    >

      <AppText variant="subtitle" style={styles.title}>

        Watch Progress

      </AppText>



      <View style={styles.summaryRow}>

        <AppText variant="bodySmall" muted style={styles.summaryLabel}>

          {formatWatchProgressEpisodeSummary(progress.watchedEpisodes, progress.totalEpisodes)}

        </AppText>

        <AppText variant="bodySmall" style={styles.summaryPercent}>

          {formatProgressPercentDisplay(progressPercent)}

        </AppText>

      </View>



      <View

        style={styles.track}

        accessibilityRole="progressbar"

        accessibilityValue={{ min: 0, max: 100, now: progressPercent }}

        testID="watch-progress-track"

      >

        <View style={[styles.fill, { width: `${progressPercent}%` }]} testID="watch-progress-fill" />

      </View>



      {nextEpisodeLine ? (

        <View style={styles.nextBlock}>

          <AppText variant="caption" muted style={styles.nextLabel}>

            Next

          </AppText>

          <AppText variant="bodySmall" style={styles.nextValue}>

            {nextEpisodeLine}

          </AppText>

        </View>

      ) : completionLabel ? (

        <View style={styles.nextBlock}>

          <AppText variant="caption" muted style={styles.nextLabel}>

            Status

          </AppText>

          <AppText variant="bodySmall" style={styles.nextValue}>

            {completionLabel}

          </AppText>

        </View>

      ) : null}

    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    marginTop: spacing.md,

    marginHorizontal: spacing.lg,

    gap: spacing.sm,

  },

  title: {

    marginBottom: 0,

  },

  summaryRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    gap: spacing.md,

  },

  summaryLabel: {

    flex: 1,

  },

  summaryPercent: {

    color: colors.textSecondary,

    fontWeight: '600',

  },

  track: {

    height: 4,

    borderRadius: borderRadius.full,

    backgroundColor: colors.border,

    overflow: 'hidden',

  },

  fill: {

    height: '100%',

    borderRadius: borderRadius.full,

    backgroundColor: colors.accent,

  },

  nextBlock: {

    gap: 2,

    marginTop: spacing.xs,

  },

  nextLabel: {

    letterSpacing: 0.2,

  },

  nextValue: {

    color: colors.textPrimary,

  },

});


