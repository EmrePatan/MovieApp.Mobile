import { api } from '@/api/client';
import {
  buildAutocompletePath,
  buildClearSearchHistoryPath,
  buildDeleteSearchHistoryItemPath,
  buildSearchHistoryPath,
  buildSearchPath,
} from './routes';
import type {
  SearchAutocompleteResponse,
  SearchHistoryResponse,
  SearchRequest,
  SearchResponse,
} from '../types';

export async function search(
  criteria: SearchRequest,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return api.get<SearchResponse>(buildSearchPath(criteria), {
    authenticated: false,
    signal,
  });
}

export async function getAutocomplete(
  query: string,
  signal?: AbortSignal,
): Promise<SearchAutocompleteResponse> {
  return api.get<SearchAutocompleteResponse>(buildAutocompletePath(query), {
    authenticated: false,
    signal,
  });
}

export async function getSearchHistory(
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<SearchHistoryResponse> {
  return api.get<SearchHistoryResponse>(buildSearchHistoryPath(page, pageSize), { signal });
}

export async function deleteSearchHistoryItem(id: string): Promise<void> {
  await api.delete<void>(buildDeleteSearchHistoryItemPath(id));
}

export async function clearSearchHistory(): Promise<void> {
  await api.delete<void>(buildClearSearchHistoryPath());
}
