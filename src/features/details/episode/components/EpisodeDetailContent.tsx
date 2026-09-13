import { View } from 'react-native';
import { DetailEpisodeActionBar } from '../../shared/components/DetailEpisodeActionBar';
import { DetailHero } from '../../shared/components/DetailHero';
import { DetailOverview } from '../../shared/components/DetailSections';
import {
  formatEpisodeBreadcrumb,
  formatEpisodeDetailMetadataLine,
} from '../../shared/utils/format-detail-metadata';
import type { EpisodeResponse } from '../types';

interface EpisodeDetailContentProps {
  episode: EpisodeResponse;
}

export function EpisodeDetailContent({ episode }: EpisodeDetailContentProps) {
  const title = episode.name ?? `Episode ${episode.episodeNumber}`;
  const metadataLine = formatEpisodeDetailMetadataLine({
    seasonNumber: episode.seasonNumber,
    episodeNumber: episode.episodeNumber,
    airDate: episode.airDate,
    runtimeMinutes: episode.runtimeMinutes,
    voteAverage: episode.voteAverage,
  });

  return (
    <View>
      <DetailHero
        title={title}
        stillPath={episode.stillPath}
        metadataLine={metadataLine}
        breadcrumb={formatEpisodeBreadcrumb({
          seasonNumber: episode.seasonNumber,
          episodeNumber: episode.episodeNumber,
        })}
        useStillAsHero
      />
      <DetailEpisodeActionBar
        episodeId={episode.id}
        tvShowId={episode.tvShowId}
        seasonNumber={episode.seasonNumber}
      />
      <DetailOverview overview={episode.overview} />
    </View>
  );
}
