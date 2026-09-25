/**
 * FlatList calls `onEndReached` once per approach of the threshold. A background
 * refetch sets `isFetching` without growing the list, so treating that flag as a
 * gate swallows the event and the next page never loads until the user scrolls
 * away and back. Only an in-flight next page should block another request.
 */
export function shouldRequestNextInfinitePage(query: {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
}): boolean {
  return Boolean(query.hasNextPage) && !query.isFetchingNextPage;
}
