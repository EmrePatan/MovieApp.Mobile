import { api } from '@/api/client';
import { getActiveHomeTraceId, markHomePerfEvent } from '@/perf/home-cold-start-trace';
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
  const traceId = getActiveHomeTraceId();
  const headers = traceId ? { 'X-Correlation-Id': traceId } : undefined;

  markHomePerfEvent('home_api_start');

  try {
    const response = await api.get<HomeResponse>(`/api/home?${query}`, { signal, headers });
    markHomePerfEvent('home_api_end');
    return response;
  } catch (error) {
    markHomePerfEvent('home_api_end');
    throw error;
  }
}
