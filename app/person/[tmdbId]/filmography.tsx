import { useTranslation } from 'react-i18next';
import { PersonFilmographyDetailContent } from '@/features/details/person/components/PersonFilmographyDetailContent';
import { usePersonDetails } from '@/features/details/person/hooks/usePersonDetails';
import { usePersonRouteTmdbId } from '@/features/details/person/hooks/usePersonRouteTmdbId';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';

export default function PersonFilmographyScreen() {
  const { t } = useTranslation();
  const { tmdbId, isInvalid } = usePersonRouteTmdbId();
  const query = usePersonDetails(tmdbId ?? 0);

  if (!tmdbId) {
    return null;
  }

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
