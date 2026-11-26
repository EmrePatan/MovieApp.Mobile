import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateProfileStatistics } from '@/features/profile/utils/invalidate-profile-statistics';
import { updateWatchDates } from '../api/watch-dates-api';
import type { UpdateWatchDatesRequest } from '../types';

export function useUpdateWatchDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateWatchDatesRequest) => updateWatchDates(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watch-history'] });
      void queryClient.invalidateQueries({ queryKey: ['library'] });
      // Also refreshes insights.
      invalidateProfileStatistics(queryClient);
    },
  });
}
