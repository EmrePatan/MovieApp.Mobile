import { api } from '@/api/client';
import { buildInsightsV3Path } from './routes';
import type { InsightsV3Response } from '../types';
import { getInsightsTimeZone } from '../utils/insights-timezone';

export async function getInsightsV3(
  timeZone = getInsightsTimeZone(),
  year?: number,
  signal?: AbortSignal,
): Promise<InsightsV3Response> {
  return api.get<InsightsV3Response>(buildInsightsV3Path(timeZone, year), { signal });
}
