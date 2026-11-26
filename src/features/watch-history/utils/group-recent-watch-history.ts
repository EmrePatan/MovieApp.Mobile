import type { RecentWatchHistoryItemResponse } from '../types';

export interface WatchHistoryShowGroup {
  kind: 'show';
  key: string;
  tvShowId: string;
  tvShowTitle: string | null;
  /** Newest first, same order as the source list. */
  episodes: RecentWatchHistoryItemResponse[];
  latestWatchedAt: string;
}

export interface WatchHistorySingle {
  kind: 'single';
  key: string;
  item: RecentWatchHistoryItemResponse;
}

export type WatchHistoryRow = WatchHistoryShowGroup | WatchHistorySingle;

/**
 * Rows only merge within one calendar month, one year-only year, or among undated entries.
 * A month, not a day: dating a weekly show by air date puts every episode on its own day.
 */
function dateKey(item: RecentWatchHistoryItemResponse): string {
  if (item.watchedAtPrecision === 'unknown') {
    return 'unknown';
  }

  return item.watchedAtPrecision === 'year'
    ? `year-${item.watchedAt.slice(0, 4)}`
    : item.watchedAt.slice(0, 7);
}

/**
 * Collapses consecutive episodes of one show watched in the same month into a
 * single row, so a binge reads as "MacGyver · 6 episodes" instead of six cards.
 */
export function groupRecentWatchHistory(
  items: RecentWatchHistoryItemResponse[],
): WatchHistoryRow[] {
  const rows: WatchHistoryRow[] = [];

  for (const [index, item] of items.entries()) {
    const last = rows[rows.length - 1];
    const canJoin =
      item.type === 'episode' &&
      item.tvShowId != null &&
      last?.kind === 'show' &&
      last.tvShowId === item.tvShowId &&
      dateKey(last.episodes[0]!) === dateKey(item);

    if (canJoin && last?.kind === 'show') {
      last.episodes.push(item);
      continue;
    }

    if (item.type === 'episode' && item.tvShowId != null) {
      rows.push({
        kind: 'show',
        key: `show-${item.tvShowId}-${dateKey(item)}-${index}`,
        tvShowId: item.tvShowId,
        tvShowTitle: item.tvShowTitle,
        episodes: [item],
        latestWatchedAt: item.watchedAt,
      });
      continue;
    }

    rows.push({
      kind: 'single',
      key: `single-${item.movieId ?? item.episodeId ?? index}-${item.watchedAt}`,
      item,
    });
  }

  // A "group" of one episode is just a normal card.
  return rows.map((row) =>
    row.kind === 'show' && row.episodes.length === 1
      ? { kind: 'single', key: row.key, item: row.episodes[0]! }
      : row,
  );
}

/** "S5 E10–E15" style span for the episodes in a group (same season), else null. */
export function describeGroupEpisodeSpan(group: WatchHistoryShowGroup): string | null {
  const numbered = group.episodes.filter(
    (episode) => episode.seasonNumber != null && episode.episodeNumber != null,
  );
  if (numbered.length === 0) {
    return null;
  }

  const seasons = new Set(numbered.map((episode) => episode.seasonNumber));
  if (seasons.size !== 1) {
    return null;
  }

  const numbers = numbered.map((episode) => episode.episodeNumber as number);
  const first = Math.min(...numbers);
  const lastNumber = Math.max(...numbers);
  const season = numbered[0]!.seasonNumber;
  return first === lastNumber ? `S${season} E${first}` : `S${season} E${first}–E${lastNumber}`;
}
