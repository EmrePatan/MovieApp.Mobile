import { api } from '@/api/client';
import { buildInsightsComparePath, buildInsightsV3Path } from './routes';
import type { InsightsCompareResponse, InsightsV3Response } from '../types';
import { getInsightsTimeZone } from '../utils/insights-timezone';

export async function getInsightsCompare(
  userId: string,
  timeZone = getInsightsTimeZone(),
  signal?: AbortSignal,
): Promise<InsightsCompareResponse> {
  return api.get<InsightsCompareResponse>(buildInsightsComparePath(userId, timeZone), { signal });
}

export async function getInsightsV3(
  timeZone = getInsightsTimeZone(),
  year?: number,
  signal?: AbortSignal,
): Promise<InsightsV3Response> {
  return api.get<InsightsV3Response>(buildInsightsV3Path(timeZone, year), { signal });
}
