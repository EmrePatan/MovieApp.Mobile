import type { HomeItem, HomeSection } from '../types';
import { createHomeContentKey } from './selectHeroCandidates';

export function homeSectionKeyExtractor(section: HomeSection): string {
  return `${section.type}-${section.displayOrder}`;
}

export function homeItemKeyExtractor(item: HomeItem): string {
  return createHomeContentKey(item);
}

export function homeComingUpItemKeyExtractor(item: HomeItem): string {
  const contentKey = createHomeContentKey(item);

  if (item.upcomingKind === 'TvEpisode') {
    if (item.episodeId) {
      return `${contentKey}:episode:${item.episodeId}`;
    }

    if (item.seasonNumber != null && item.episodeNumber != null) {
      return `${contentKey}:s${item.seasonNumber}e${item.episodeNumber}`;
    }
  }

  return contentKey;
}
