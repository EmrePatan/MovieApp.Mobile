import { usePathname } from 'expo-router';
import {
  parseCollectionStackSegment,
  parseCollectionTmdbIdFromPathname,
  parsePositiveInt,
} from '../../shared/routes';

export function useCollectionRouteTmdbId() {
  const pathname = usePathname();
  const pathnameTmdbId = parseCollectionTmdbIdFromPathname(pathname);
  const rawSegment = parseCollectionStackSegment(pathname);
  const isActive = pathnameTmdbId != null;

  return {
    tmdbId: pathnameTmdbId,
    isActive,
    isInvalid: Boolean(rawSegment) && pathnameTmdbId == null,
  };
}
