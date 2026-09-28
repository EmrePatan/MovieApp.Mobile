import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import {
  disableWatchlistShare,
  enableWatchlistShare,
  getWatchlistShareStatus,
  rotateWatchlistShare,
} from '../api/watchlist-share-api';
import { activeWatchlistSharesQueryKey } from './useActiveWatchlistShares';

const statusKey = (watchlistId: string) => ['watchlist-share', 'status', watchlistId] as const;

function storedUrlKey(watchlistId: string) {
  return `moviecave.watchlist-share-url.${watchlistId}`;
}

export function useWatchlistShareStatus(watchlistId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: watchlistId ? statusKey(watchlistId) : ['watchlist-share', 'status', 'none'],
    queryFn: ({ signal }) => getWatchlistShareStatus(watchlistId!, signal),
    enabled: enabled && Boolean(watchlistId),
  });
}

export function useWatchlistShareMutations(watchlistId: string | null) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (watchlistId) {
      void queryClient.invalidateQueries({ queryKey: statusKey(watchlistId) });
    }
    void queryClient.invalidateQueries({ queryKey: activeWatchlistSharesQueryKey });
  };

  const enable = useMutation({
    mutationFn: () => enableWatchlistShare(watchlistId!),
    onSuccess: async (response) => {
      if (watchlistId && response.shareUrl) {
        await SecureStore.setItemAsync(storedUrlKey(watchlistId), response.shareUrl);
      }
      invalidate();
    },
  });

  const disable = useMutation({
    mutationFn: () => disableWatchlistShare(watchlistId!),
    onSuccess: async () => {
      if (watchlistId) {
        await SecureStore.deleteItemAsync(storedUrlKey(watchlistId));
      }
      invalidate();
    },
  });

  const rotate = useMutation({
    mutationFn: () => rotateWatchlistShare(watchlistId!),
    onSuccess: async (response) => {
      if (watchlistId) {
        await SecureStore.setItemAsync(storedUrlKey(watchlistId), response.shareUrl);
      }
      invalidate();
    },
  });

  return { enable, disable, rotate };
}

export async function getStoredWatchlistShareUrl(watchlistId: string): Promise<string | null> {
  return SecureStore.getItemAsync(storedUrlKey(watchlistId));
}
