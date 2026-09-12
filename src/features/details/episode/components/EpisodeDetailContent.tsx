import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import { CatalogImage } from '../../shared/components/CatalogImage';
import { DetailMetaItem, DetailOverview } from '../../shared/components/DetailSections';
import type { EpisodeResponse } from '../types';
import {
  formatIsoDate,
  formatRating,
  formatRuntimeMinutes,
  formatVoteCount,
} from '@/utils/format';
import { spacing } from '@/theme/spacing';

interface EpisodeDetailContentProps {
  episode: EpisodeResponse;
}

export function EpisodeDetailContent({ episode }: EpisodeDetailContentProps) {
  const title = episode.name ?? `Episode ${episode.episodeNumber}`;
  const airDate = formatIsoDate(episode.airDate);
  const runtime = formatRuntimeMinutes(episode.runtimeMinutes);

  return (
    <View>
      <View style={styles.stillContainer}>
        <CatalogImage
          path={episode.stillPath}
          width={320}
          height={180}
          accessibilityLabel={`${title} still`}
          rounded
        />
      </View>

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          <WatchedButton
            target={{
              type: 'episode',
              contentId: episode.id,
              tvShowId: episode.tvShowId,
              seasonNumber: episode.seasonNumber,
            }}
          />
        </View>
        <View style={styles.metaGrid}>
          <DetailMetaItem
            label="Season / Episode"
            value={`S${episode.seasonNumber} E${episode.episodeNumber}`}
          />
          {airDate ? <DetailMetaItem label="Air date" value={airDate} /> : null}
          {runtime ? <DetailMetaItem label="Runtime" value={runtime} /> : null}
          <DetailMetaItem label="Rating" value={`★ ${formatRating(episode.voteAverage)}`} />
          <DetailMetaItem label="Votes" value={formatVoteCount(episode.voteCount)} />
        </View>
      </View>

      <DetailOverview overview={episode.overview} />
    </View>
  );
}

const styles = StyleSheet.create({
  stillContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  metaGrid: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
