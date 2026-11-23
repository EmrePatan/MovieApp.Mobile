import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'insights.dnaCover.v1:';

/**
 * The poster a member picked as their Movie DNA cover. Kept on the device per account;
 * `null` means "use the automatic one".
 */
export function useDnaCover(accountKey: string | undefined) {
  const [coverPath, setCoverPath] = useState<string | null>(null);

  useEffect(() => {
    if (!accountKey) {
      return;
    }
    let cancelled = false;
    void AsyncStorage.getItem(STORAGE_PREFIX + accountKey)
      .then((stored) => {
        if (!cancelled) setCoverPath(stored?.trim() ? stored : null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [accountKey]);

  const setCover = useCallback(
    (path: string | null) => {
      setCoverPath(path);
      if (!accountKey) return;
      const write = path
        ? AsyncStorage.setItem(STORAGE_PREFIX + accountKey, path)
        : AsyncStorage.removeItem(STORAGE_PREFIX + accountKey);
      void write.catch(() => undefined);
    },
    [accountKey],
  );

  return { coverPath, setCover };
}
