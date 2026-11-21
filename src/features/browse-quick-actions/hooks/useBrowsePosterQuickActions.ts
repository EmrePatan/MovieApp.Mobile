import { useCallback } from 'react';
import { useOptionalBrowseQuickActions } from '../BrowseQuickActionsProvider';
import { useBrowseItemWatchState } from './useBrowseItemWatchState';
import type { BrowseQuickActionsMediaType, BrowseQuickActionsTarget } from '../types';

export function useBrowsePosterQuickActions(target: BrowseQuickActionsTarget | null) {
  const host = useOptionalBrowseQuickActions();
  const watchState = useBrowseItemWatchState(
    target?.contentType ?? 'movie',
    target?.contentId ?? '',
  );

  const supported = Boolean(host && target?.contentId);

  const onLongPress = useCallback(() => {
    if (!host || !target) {
      return;
    }
    host.openQuickActions(target);
  }, [host, target]);

  const onToggleWatched = useCallback(() => {
    if (!host || !target) {
      return;
    }
    host.toggleWatched(target, watchState.isWatched);
  }, [host, target, watchState.isWatched]);

  return {
    supported,
    isWatched: watchState.isWatched,
    watchedBusy: supported && target ? host!.isWatchedTogglePending(target.contentId) : false,
    onLongPress: supported ? onLongPress : undefined,
    onToggleWatched: supported ? onToggleWatched : undefined,
  };
}

export function buildBrowseQuickActionsTarget(input: {
  contentId: string;
  contentType: BrowseQuickActionsMediaType;
  title: string;
  posterUrl: string | null | undefined;
  year?: number | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
}): BrowseQuickActionsTarget {
  return {
    contentId: input.contentId,
    contentType: input.contentType,
    title: input.title,
    posterUrl: input.posterUrl ?? null,
    year: input.year ?? null,
    releaseDate: input.releaseDate ?? null,
    voteAverage: input.voteAverage ?? null,
  };
}
