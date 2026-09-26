import { useQuery } from '@tanstack/react-query';
import { detailQueryLocaleTagFromLanguage } from '@/features/locale/detail-query-locale';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { getTvShowDetails } from '../api/tv-api';
import { isValidGuid } from '../../shared/routes';

export function tvShowQueryKey(id: string, localeTag: string) {
  return ['tvshow', id, localeTag] as const;
}

export function useTvShowDetails(id: string | undefined) {
  const { language, isHydrated } = useLocalePreference();
  const localeTag = detailQueryLocaleTagFromLanguage(language);
  const enabled = isValidGuid(id) && isHydrated;

  return useQuery({
    queryKey: tvShowQueryKey(id ?? '', localeTag),
    queryFn: ({ signal }) => getTvShowDetails(id!, signal),
    enabled,
    staleTime: 60_000,
  });
}
