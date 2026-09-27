import type { UserReviewListItem } from '../types/my-comments';

export function getMyCommentReleaseYear(releaseDate: string | null): number | null {
  if (!releaseDate) {
    return null;
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

export function buildMyCommentMetadataLabel(
  item: UserReviewListItem,
  movieLabel: string,
  tvLabel: string,
): string {
  const typeLabel = item.contentType === 'movie' ? movieLabel : tvLabel;
  const year = getMyCommentReleaseYear(item.releaseDate);

  return year == null ? typeLabel : `${typeLabel} · ${year}`;
}
