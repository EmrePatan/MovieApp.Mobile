import { api } from '@/api/client';
import type { ProductMetricName } from '../product-metric-types';
import { buildIncrementProductMetricPath } from './routes';

export interface IncrementProductMetricRequest {
  metricName: ProductMetricName;
}

export async function postProductMetric(
  metricName: ProductMetricName,
  signal?: AbortSignal,
): Promise<void> {
  await api.post<void>(
    buildIncrementProductMetricPath(),
    { metricName },
    {
      authenticated: false,
      signal,
    },
  );
}
