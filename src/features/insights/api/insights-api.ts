import { api } from '@/api/client';
import { buildInsightsAnalyticsPath, buildInsightsSummaryPath } from './routes';
import type { InsightsAnalyticsResponse, InsightsSummaryResponse } from '../types';
import { getInsightsTimeZone } from '../utils/insights-timezone';

export async function getInsightsSummary(
  timeZone = getInsightsTimeZone(),
  signal?: AbortSignal,
): Promise<InsightsSummaryResponse> {
  return api.get<InsightsSummaryResponse>(buildInsightsSummaryPath(timeZone), { signal });
}

export async function getInsightsAnalytics(
  timeZone = getInsightsTimeZone(),
  signal?: AbortSignal,
): Promise<InsightsAnalyticsResponse> {
  return api.get<InsightsAnalyticsResponse>(buildInsightsAnalyticsPath(timeZone), { signal });
}
