import { useEffect, useMemo } from 'react';
import type { ImperativeRouter } from 'expo-router';
import { flattenUpcomingPages } from '../utils/upcoming-catalog-items';
import type { ComingUpTab } from '../navigation/coming-up-navigation';
import { useUpcomingCatalog } from './useUpcomingCatalog';

function isExplicitComingUpTab(value?: string | string[]): boolean {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === 'for-you' || normalized === 'upcoming';
}

export function parseExplicitComingUpTab(value?: string | string[]): ComingUpTab | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (normalized === 'upcoming') {
    return 'upcoming';
  }

  if (normalized === 'for-you') {
    return 'for-you';
  }

  return null;
}

interface UseComingUpInitialTabOptions {
  tabParam?: string | string[];
  isAuthenticated: boolean;
  router: ImperativeRouter;
}

export function useComingUpInitialTab({
  tabParam,
  isAuthenticated,
  router,
}: UseComingUpInitialTabOptions) {
  const explicitTab = parseExplicitComingUpTab(tabParam);
  const hasExplicitTab = explicitTab !== null;

  const followedPreview = useUpcomingCatalog('followed', 1, {
    enabled: isAuthenticated && !hasExplicitTab,
  });

  const followedPreviewItems = useMemo(
    () => flattenUpcomingPages(followedPreview.data?.pages ?? []),
    [followedPreview.data?.pages],
  );

  const resolvedTab = useMemo<ComingUpTab | null>(() => {
    if (explicitTab) {
      return explicitTab;
    }

    if (!isAuthenticated) {
      return 'upcoming';
    }

    if (followedPreview.isLoading) {
      return null;
    }

    return followedPreviewItems.length > 0 ? 'for-you' : 'upcoming';
  }, [
    explicitTab,
    followedPreview.isLoading,
    followedPreviewItems.length,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (hasExplicitTab || resolvedTab === null) {
      return;
    }

    router.setParams({ tab: resolvedTab });
  }, [hasExplicitTab, resolvedTab, router]);

  const isResolvingInitialTab =
    !hasExplicitTab && isAuthenticated && followedPreview.isLoading;

  return {
    activeTab: resolvedTab,
    isResolvingInitialTab,
    hasExplicitTab,
  };
}
