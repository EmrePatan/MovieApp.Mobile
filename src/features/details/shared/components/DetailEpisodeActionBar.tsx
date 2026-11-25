import { StyleSheet, View } from 'react-native';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import { spacing } from '@/theme/spacing';
import {
  DetailPersonalRatingProvider,
  DetailPersonalRatingRow,
  useOptionalDetailPersonalRating,
} from './DetailPersonalRatingExperience';

interface DetailEpisodeActionBarProps {
  episodeId: string;
  tvShowId: string;
  seasonNumber: number;
}

export function DetailEpisodeActionBar({
  episodeId,
  tvShowId,
  seasonNumber,
}: DetailEpisodeActionBarProps) {
  return (
    <DetailPersonalRatingProvider contentType="episode" contentId={episodeId} watchEligible>
      <EpisodeActionControls
        episodeId={episodeId}
        tvShowId={tvShowId}
        seasonNumber={seasonNumber}
      />
    </DetailPersonalRatingProvider>
  );
}

function EpisodeActionControls({
  episodeId,
  tvShowId,
  seasonNumber,
}: DetailEpisodeActionBarProps) {
  const personalRating = useOptionalDetailPersonalRating();

  return (
    <View>
      <View style={styles.container}>
        <WatchedButton
          size={44}
          target={{
            type: 'episode',
            contentId: episodeId,
            tvShowId,
            seasonNumber,
          }}
          onMarkedWatched={personalRating?.handleMarkedWatched}
          onBeforeUnwatch={personalRating?.confirmUnwatchIfNeeded}
        />
      </View>
      <DetailPersonalRatingRow
        contentType="episode"
        contentId={episodeId}
        watchEligible
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
