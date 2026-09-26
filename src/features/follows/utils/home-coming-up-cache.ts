import type { QueryClient } from '@tanstack/react-query';
import { HOME_QUERY_KEY_ROOT } from '@/features/home/hooks/home-query-keys';
import type { HomeSection } from '@/features/home/types';

interface HomeSectionsCache {
  sections: HomeSection[];
}

function patchComingUpRemoval(
  current: HomeSectionsCache,
  contentId: string,
): HomeSectionsCache | undefined {
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
    return undefined;
  }

  return { ...current, sections };
}

export function removeFollowedCatalogFromHomeCaches(
  queryClient: QueryClient,
  contentId: string,
): void {
  queryClient.setQueriesData<HomeSectionsCache>(
    { queryKey: HOME_QUERY_KEY_ROOT },
    (current) => {
      if (!current) {
        return current;
      }

      return patchComingUpRemoval(current, contentId) ?? current;
    },
  );
}
