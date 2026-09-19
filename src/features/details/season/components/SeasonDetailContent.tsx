import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const title = season.name ?? `Season ${season.seasonNumber}`;
  const metadataLine = formatSeasonDetailMetadataLine({
    seasonNumber: season.seasonNumber,
    airDate: season.airDate,
    episodeCount: season.episodeCount,
  });

  return (
    <EpisodeList
      key={`${season.tvShowId}-${season.seasonNumber}`}
      tvShowId={season.tvShowId}
      seasonNumber={season.seasonNumber}
      episodes={season.episodes}
      listHeader={
        <>
          <DetailHero
            title={title}
            posterPath={season.posterPath}
            backdropPath={season.posterPath}
            metadataLine={metadataLine}
            posterAccessibilityLabel={t('common.posterAccessibility', { title })}
          />
          <DetailOverview overview={season.overview} />
          <SeasonProgressInline
            tvShowId={season.tvShowId}
            seasonNumber={season.seasonNumber}
            fallbackTotalEpisodes={season.episodeCount}
          />
        </>
      }
    />
  );
}
