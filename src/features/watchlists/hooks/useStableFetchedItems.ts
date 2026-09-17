import { useRef } from 'react';

export function useStableFetchedItems<T>(
  items: T[],
  isFetching: boolean,
): T[] {
  const stableRef = useRef<T[]>([]);

  if (!isFetching) {
    stableRef.current = items;
  }

  if (isFetching && items.length === 0 && stableRef.current.length > 0) {
    return stableRef.current;
  }

  return items;
}
