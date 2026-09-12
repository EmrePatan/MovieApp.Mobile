import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '../../shared/components/CatalogImage';
import { DetailMetaItem, DetailOverview } from '../../shared/components/DetailSections';
import { WatchProgressSection } from '@/features/watch-history/components/WatchProgressSection';
import { EpisodeList } from './EpisodeList';
import type { SeasonResponse } from '../types';
import { formatIsoDate } from '@/utils/format';
import { spacing } from '@/theme/spacing';

interface SeasonDetailContentProps {
  season: SeasonResponse;
}

export function SeasonDetailContent({ season }: SeasonDetailContentProps) {
  const airDate = formatIsoDate(season.airDate);
  const title = season.name ?? `Season ${season.seasonNumber}`;
  const episodeCount =
    season.episodeCount != null ? `${season.episodeCount} episodes` : null;

  return (
    <View>
      <View style={styles.header}>
        <CatalogImage
          path={season.posterPath}
          width={120}
          height={180}
          accessibilityLabel={`${title} poster`}
        />
        <View style={styles.meta}>
          <AppText variant="title">{title}</AppText>
          <DetailMetaItem label="Season" value={String(season.seasonNumber)} />
          {airDate ? <DetailMetaItem label="Air date" value={airDate} /> : null}
          {episodeCount ? <DetailMetaItem label="Episodes" value={episodeCount} /> : null}
        </View>
      </View>

      <DetailOverview overview={season.overview} />
      <WatchProgressSection tvShowId={season.tvShowId} seasonNumber={season.seasonNumber} />
      <EpisodeList
        tvShowId={season.tvShowId}
        seasonNumber={season.seasonNumber}
        episodes={season.episodes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  meta: {
    flex: 1,
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
