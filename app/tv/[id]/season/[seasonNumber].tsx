import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { SeasonDetailContent } from '@/features/details/season/components/SeasonDetailContent';
import { useSeason } from '@/features/details/season/hooks/useSeason';
import { isValidGuid, parsePositiveInt } from '@/features/details/shared/routes';

export default function SeasonDetailScreen() {
  const { t } = useTranslation();
  const { id, seasonNumber: seasonNumberParam } = useLocalSearchParams<{
    id: string;
    seasonNumber: string;
  }>();

  const tvShowId = typeof id === 'string' ? id : undefined;
  const seasonNumber = parsePositiveInt(
    typeof seasonNumberParam === 'string' ? seasonNumberParam : undefined,
  );
  const query = useSeason(tvShowId, seasonNumber);

  const invalidParamsMessage =
    !isValidGuid(tvShowId) || seasonNumber == null
      ? t('details.queryState.invalidRequestMessage')
      : undefined;

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={invalidParamsMessage}
      notFoundTitle={t('details.queryState.invalidRequestTitle')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
      invalidRequestMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(season) => <SeasonDetailContent season={season} />}
    </DetailQueryState>
  );
}
