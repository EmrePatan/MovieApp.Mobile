import { useFollowingCatalog } from './useFollowingCatalog';

const FOLLOWING_COUNT_PAGE_SIZE = 1;

export function useFollowingCount() {
  const query = useFollowingCatalog(FOLLOWING_COUNT_PAGE_SIZE);
  const totalCount = query.data?.pages[0]?.totalCount ?? 0;

  return {
    totalCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}
