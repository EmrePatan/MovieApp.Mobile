import { useTranslation } from 'react-i18next';
import { PersonFilmographyDetailContent } from '@/features/details/person/components/PersonFilmographyDetailContent';
import { usePersonDetails } from '@/features/details/person/hooks/usePersonDetails';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { parsePositiveInt } from '@/features/details/shared/routes';
import { useLocalSearchParams } from 'expo-router';

export default function PersonFilmographyScreen() {
  const { t } = useTranslation();
  const { tmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const resolvedTmdbId = parsePositiveInt(tmdbId);
  const isInvalid = resolvedTmdbId === null;
  const query = usePersonDetails(isInvalid || resolvedTmdbId === null ? 0 : resolvedTmdbId);

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={isInvalid ? t('details.queryState.invalidRequestMessage') : undefined}
      notFoundTitle={t('details.sections.filmography')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(person) => <PersonFilmographyDetailContent person={person} />}
    </DetailQueryState>
  );
}
