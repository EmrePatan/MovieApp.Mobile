import { useQuery } from '@tanstack/react-query';
import { detailQueryLocaleTagFromLanguage } from '@/features/locale/detail-query-locale';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { getMovieDetails } from '../api/movie-api';
import { isValidGuid } from '../../shared/routes';

export function movieQueryKey(id: string, localeTag: string) {
  return ['movie', id, localeTag] as const;
}

export function useMovieDetails(id: string | undefined) {
  const { language, isHydrated } = useLocalePreference();
  const localeTag = detailQueryLocaleTagFromLanguage(language);
  const enabled = isValidGuid(id) && isHydrated;

  return useQuery({
    queryKey: movieQueryKey(id ?? '', localeTag),
    queryFn: ({ signal }) => getMovieDetails(id!, signal),
    enabled,
    staleTime: 60_000,
  });
}
