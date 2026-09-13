import { View } from 'react-native';
import { DetailHero } from '../../shared/components/DetailHero';
import { DetailOverview } from '../../shared/components/DetailSections';
import { SeasonProgressInline } from '@/features/watch-history/components/SeasonProgressInline';
import { EpisodeList } from './EpisodeList';
import { formatSeasonDetailMetadataLine } from '../../shared/utils/format-detail-metadata';
import type { SeasonResponse } from '../types';

interface SeasonDetailContentProps {
  season: SeasonResponse;
}

export function SeasonDetailContent({ season }: SeasonDetailContentProps) {
  const title = season.name ?? `Season ${season.seasonNumber}`;
  const metadataLine = formatSeasonDetailMetadataLine({
    seasonNumber: season.seasonNumber,
    airDate: season.airDate,
    episodeCount: season.episodeCount,
  });

  return (
    <View>
      <DetailHero
        title={title}
        posterPath={season.posterPath}
        backdropPath={season.posterPath}
        metadataLine={metadataLine}
        posterAccessibilityLabel={`${title} poster`}
      />
      <DetailOverview overview={season.overview} />
      <SeasonProgressInline
        tvShowId={season.tvShowId}
        seasonNumber={season.seasonNumber}
        fallbackTotalEpisodes={season.episodeCount}
      />
      <EpisodeList
        key={`${season.tvShowId}-${season.seasonNumber}`}
        tvShowId={season.tvShowId}
        seasonNumber={season.seasonNumber}
        episodes={season.episodes}
      />
    </View>
  );
}
