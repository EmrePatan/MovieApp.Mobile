import { useRef } from 'react';

export function useStableFetchedItems<T>(
  items: T[],
  isFetching: boolean,
  scopeKey = 'default',
): T[] {
  const stableRef = useRef<T[]>([]);
  const scopeRef = useRef(scopeKey);

  if (scopeRef.current !== scopeKey) {
    scopeRef.current = scopeKey;
    stableRef.current = [];
  }

  if (!isFetching) {
    stableRef.current = items;
  }

  if (isFetching && items.length === 0 && stableRef.current.length > 0) {
    return stableRef.current;
  }

  return items;
}
