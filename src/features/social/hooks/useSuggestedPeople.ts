import { useMemo } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useSocialFeed } from './useSocialQueries';

export interface SuggestedPerson {
  id: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
}

const DEFAULT_LIMIT = 8;

/**
 * People worth a look when a search box is still empty: the latest authors on the
 * discover feed, de-duplicated and without the signed-in user.
 */
export function useSuggestedPeople(limit = DEFAULT_LIMIT) {
  const { user: me } = useAuth();
  const feed = useSocialFeed('discover');

  const people = useMemo(() => {
    const seen = new Set<string>();
    const result: SuggestedPerson[] = [];
    for (const page of feed.data?.pages ?? []) {
      for (const item of page.items) {
        if (!item.actorId || item.actorId === me?.id || seen.has(item.actorId)) {
          continue;
        }
        seen.add(item.actorId);
        result.push({
          id: item.actorId,
          userName: item.userName,
          displayName: item.displayName,
          avatarUrl: item.avatarUrl,
        });
        if (result.length >= limit) {
          return result;
        }
      }
    }
    return result;
  }, [feed.data?.pages, limit, me?.id]);

  return { people, isLoading: feed.isLoading };
}
