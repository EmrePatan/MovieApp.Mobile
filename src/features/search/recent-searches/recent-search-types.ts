export const MAX_RECENT_SEARCHES = 5;

export interface RecentSearchStoredItem {
  id: string;
  query: string;
  accessedAt: number;
}
