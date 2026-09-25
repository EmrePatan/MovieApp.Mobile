import type { HomeItem, HomeSection } from '../types';
import { createHomeContentKey } from './selectHeroCandidates';

export function homeSectionKeyExtractor(section: HomeSection): string {
  return `${section.type}-${section.displayOrder}`;
}

export function homeItemKeyExtractor(item: HomeItem): string {
  return createHomeContentKey(item);
}

export function areHomeItemsVisuallyEqual(
  previous: HomeItem,
  next: HomeItem | undefined,
): boolean {
  if (!next) {
    return false;
  }

  return (
    previous.id === next.id &&
    previous.contentType === next.contentType &&
    previous.title === next.title &&
    previous.posterUrl === next.posterUrl &&
    previous.backdropUrl === next.backdropUrl &&
    previous.releaseDate === next.releaseDate &&
    previous.voteAverage === next.voteAverage &&
    previous.upcomingKind === next.upcomingKind &&
    previous.episodeName === next.episodeName &&
    previous.seasonNumber === next.seasonNumber &&
    previous.episodeNumber === next.episodeNumber
  );
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
