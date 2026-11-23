import { useMemo } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useSocialProfile, useSocialProfileStatistics } from '@/features/social/hooks/useSocialQueries';
import { resolveProfileLibraryTitles } from '@/features/social/utils/resolve-profile-library-titles';
import { resolveSocialProfileCoverUri } from '@/features/social/utils/resolve-social-profile-cover';

/** Current user's cover image plus the poster paths they can pick a cover from. */
export function useOwnProfileCover() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profileQuery = useSocialProfile(userId);
  const statistics = useSocialProfileStatistics(userId);

  const shelfPosters = useMemo(() => {
    const items = resolveProfileLibraryTitles(statistics.data);
    return items
      .map((item) => item.posterPath)
      .filter((path): path is string => Boolean(path?.trim()));
  }, [statistics.data]);

  const profile = profileQuery.data;
  const coverUri = resolveSocialProfileCoverUri(
    profile?.coverImageUrl,
    profile?.coverPosterPath,
    shelfPosters[0] ?? null,
  );
  const isCustomPhotoCover = Boolean(profile?.coverImageUrl?.trim()) && !coverUri?.includes('image.tmdb.org');

  return { userId, coverUri, isCustomPhotoCover, shelfPosters };
}
