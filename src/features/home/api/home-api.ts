import { api } from '@/api/client';
import type { HomeRequest, HomeResponse } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';

export function buildHomeQueryString(criteria: HomeRequest = {}): string {
  const params = new URLSearchParams();
  params.set('type', criteria.type ?? 'all');
  params.set('sectionSize', String(criteria.sectionSize ?? DEFAULT_HOME_SECTION_SIZE));
  return params.toString();
}

export async function getHome(
  criteria: HomeRequest = {},
  signal?: AbortSignal,
): Promise<HomeResponse> {
  const query = buildHomeQueryString(criteria);
  return api.get<HomeResponse>(`/api/home?${query}`, { signal });
}
