import { api } from '@/api/client';
import type { UpdateWatchDatesRequest, UpdateWatchDatesResponse } from '../types';

export async function updateWatchDates(
  request: UpdateWatchDatesRequest,
): Promise<UpdateWatchDatesResponse> {
  return api.put<UpdateWatchDatesResponse>('/api/watch-history/dates', request);
}
