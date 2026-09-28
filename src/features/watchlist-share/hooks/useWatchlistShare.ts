import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import {
  disableWatchlistShare,
  enableWatchlistShare,
  getWatchlistShareStatus,
  rotateWatchlistShare,
} from '../api/watchlist-share-api';

const STATUS_KEY = ['watchlist-share', 'status'] as const;
const STORED_URL_KEY = 'moviecave.watchlist-share-url';

export function useWatchlistShareStatus(enabled: boolean) {
  return useQuery({
    queryKey: STATUS_KEY,
    queryFn: ({ signal }) => getWatchlistShareStatus(signal),
    enabled,
  });
}

export function useWatchlistShareMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: STATUS_KEY });
  };

  const enable = useMutation({
    mutationFn: enableWatchlistShare,
    onSuccess: async (response) => {
      if (response.shareUrl) {
        await SecureStore.setItemAsync(STORED_URL_KEY, response.shareUrl);
      }
      invalidate();
    },
  });

  const disable = useMutation({
    mutationFn: disableWatchlistShare,
    onSuccess: async () => {
      await SecureStore.deleteItemAsync(STORED_URL_KEY);
      invalidate();
    },
  });

  const rotate = useMutation({
    mutationFn: rotateWatchlistShare,
    onSuccess: async (response) => {
      await SecureStore.setItemAsync(STORED_URL_KEY, response.shareUrl);
      invalidate();
    },
  });

  return { enable, disable, rotate };
}

export async function getStoredWatchlistShareUrl(): Promise<string | null> {
  return SecureStore.getItemAsync(STORED_URL_KEY);
}
