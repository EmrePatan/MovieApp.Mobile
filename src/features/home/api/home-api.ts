import { api } from '@/api/client';
import { getActiveHomeTraceId, markHomePerfEvent } from '@/perf/home-cold-start-trace';
import type {
  HomeBrowseResponse,
  HomePersonalizedResponse,
  HomeRequest,
  HomeResponse,
} from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';

export function buildHomeQueryString(criteria: HomeRequest = {}): string {
  const params = new URLSearchParams();
  params.set('type', criteria.type ?? 'all');
  params.set('sectionSize', String(criteria.sectionSize ?? DEFAULT_HOME_SECTION_SIZE));
  return params.toString();
}

function createHomeRequestHeaders(): Record<string, string> | undefined {
  const traceId = getActiveHomeTraceId();
  return traceId ? { 'X-Correlation-Id': traceId } : undefined;
}

export async function getHome(
  criteria: HomeRequest = {},
  signal?: AbortSignal,
): Promise<HomeResponse> {
  const query = buildHomeQueryString(criteria);
  const headers = createHomeRequestHeaders();

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

export async function getHomeBrowse(
  criteria: HomeRequest = {},
  signal?: AbortSignal,
): Promise<HomeBrowseResponse> {
  const query = buildHomeQueryString(criteria);
  const headers = createHomeRequestHeaders();

  markHomePerfEvent('home_browse_api_start');

  try {
    const response = await api.get<HomeBrowseResponse>(`/api/home/browse?${query}`, {
      signal,
      headers,
    });
    markHomePerfEvent('home_browse_api_end');
    return response;
  } catch (error) {
    markHomePerfEvent('home_browse_api_end');
    throw error;
  }
}

export async function getHomePersonalized(
  criteria: HomeRequest = {},
  signal?: AbortSignal,
): Promise<HomePersonalizedResponse> {
  const query = buildHomeQueryString(criteria);
  const headers = createHomeRequestHeaders();

  markHomePerfEvent('home_personalized_api_start');

  try {
    const response = await api.get<HomePersonalizedResponse>(`/api/home/personalized?${query}`, {
      signal,
      headers,
    });
    markHomePerfEvent('home_personalized_api_end');
    return response;
  } catch (error) {
    markHomePerfEvent('home_personalized_api_end');
    throw error;
  }
}
