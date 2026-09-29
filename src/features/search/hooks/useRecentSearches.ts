import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import {
  addRecentEntity,
  addRecentQuery,
  clearRecentSearches,
  loadRecentSearches,
  removeRecentSearchItem,
} from '../recent-searches/recent-search-storage';
import type {
  RecentSearchEntityPayload,
  RecentSearchStoredItem,
} from '../recent-searches/recent-search-types';

export function useRecentSearches() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<RecentSearchStoredItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void loadRecentSearches(userId).then((loaded) => {
      if (!cancelled) {
        setItems(loaded);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const recordQuery = useCallback(
    async (query: string) => {
      const next = await addRecentQuery(userId, query);
      setItems(next);
      return next;
    },
    [userId],
  );

  const recordEntity = useCallback(
    async (entity: Omit<RecentSearchEntityPayload, 'accessedAt'>) => {
      const next = await addRecentEntity(userId, entity);
      setItems(next);
      return next;
    },
    [userId],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const next = await removeRecentSearchItem(userId, id);
      setItems(next);
      return next;
    },
    [userId],
  );

  const clearAll = useCallback(async () => {
    const next = await clearRecentSearches(userId);
    setItems(next);
    return next;
  }, [userId]);

  return {
    items,
    isLoading,
    recordQuery,
    recordEntity,
    removeItem,
    clearAll,
  };
}
