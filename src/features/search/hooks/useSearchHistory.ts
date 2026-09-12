import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  getSearchHistory,
} from '../api/search-api';
import { searchHistoryQueryKey } from './search-query-keys';
import { DEFAULT_SEARCH_HISTORY_PAGE_SIZE } from '../types';

export function useSearchHistory() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: searchHistoryQueryKey(1, DEFAULT_SEARCH_HISTORY_PAGE_SIZE),
    queryFn: ({ signal }) =>
      getSearchHistory(1, DEFAULT_SEARCH_HISTORY_PAGE_SIZE, signal),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

function invalidateSearchHistory(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['search-history'] });
}

export function useDeleteSearchHistoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSearchHistoryItem(id),
    onSuccess: () => {
      invalidateSearchHistory(queryClient);
    },
  });
}

export function useClearSearchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearSearchHistory(),
    onSuccess: () => {
      invalidateSearchHistory(queryClient);
    },
  });
}
