import { useTranslation } from 'react-i18next';
import { PersonDetailContent } from '@/features/details/person/components/PersonDetailContent';
import { usePersonDetails } from '@/features/details/person/hooks/usePersonDetails';
import { usePersonRouteTmdbId } from '@/features/details/person/hooks/usePersonRouteTmdbId';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';

export default function PersonDetailScreen() {
  const { t } = useTranslation();
  const { tmdbId, isInvalid } = usePersonRouteTmdbId();
  const query = usePersonDetails(tmdbId);

  if (!tmdbId) {
    return null;
  }

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={isInvalid ? t('details.queryState.invalidRequestMessage') : undefined}
      notFoundTitle={t('details.queryState.invalidRequestTitle')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(person) => <PersonDetailContent person={person} />}
    </DetailQueryState>
  );
}
