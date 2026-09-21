import { useTranslation } from 'react-i18next';
import { useCatalogChildDestinationGestureGuard } from '@/features/details/shared/navigation/useCatalogChildDestinationGestureGuard';
import { CreditsDetailContent } from '@/features/details/credits/components/CreditsDetailContent';
import { useCreditsRouteState } from '@/features/details/credits/hooks/useCreditsRouteState';
import { useMovieCredits } from '@/features/details/credits/hooks/useCredits';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';

export default function MovieCreditsScreen() {
  const { t } = useTranslation();
  useCatalogChildDestinationGestureGuard();
  const { resolvedId, isActive, isInvalid, title } = useCreditsRouteState('movie');
  const query = useMovieCredits(isActive && resolvedId ? resolvedId : '');

  if (!isActive) {
    return null;
  }

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={isInvalid ? t('details.queryState.invalidRequestMessage') : undefined}
      notFoundTitle={t('details.credits.title')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(credits) => (
        <CreditsDetailContent
          contentType="movie"
          contentId={resolvedId ?? ''}
          credits={credits}
          title={title}
        />
      )}
    </DetailQueryState>
  );
}
