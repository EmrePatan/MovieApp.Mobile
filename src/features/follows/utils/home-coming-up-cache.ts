import type { QueryClient } from '@tanstack/react-query';
import { HOME_QUERY_KEY_ROOT } from '@/features/home/hooks/home-query-keys';
import type { HomeResponse } from '@/features/home/types';

export function removeFollowedCatalogFromHomeCaches(
  queryClient: QueryClient,
  contentId: string,
): void {
  queryClient.setQueriesData<HomeResponse>(
    { queryKey: HOME_QUERY_KEY_ROOT },
    (current) => {
      if (!current) {
        return current;
      }

      let removedComingUpItem = false;
      const sections = current.sections
        .map((section) => {
          if (section.type !== 'ComingUp') {
            return section;
          }

          const items = section.items.filter((item) => item.id !== contentId);
          if (items.length !== section.items.length) {
            removedComingUpItem = true;
          }

          return { ...section, items };
        })
        .filter((section) => section.type !== 'ComingUp' || section.items.length > 0);

      if (!removedComingUpItem && sections.length === current.sections.length) {
        return current;
      }

      return { ...current, sections };
    },
  );
}
