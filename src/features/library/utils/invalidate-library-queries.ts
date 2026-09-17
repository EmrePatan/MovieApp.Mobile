import type { QueryClient } from '@tanstack/react-query';

export function invalidateLibraryQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ['library'] });
}
