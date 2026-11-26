import { getUiFormatLocaleTag, i18n } from '@/i18n';
import type { HomeItem, HomeSection } from '@/features/home/types';
import {
  LEAVING_SOON_RAIL_MINIMUM,
  type LeavingSoonItem,
  type LeavingSoonPlatform,
  type LeavingSoonResponse,
} from './leaving-soon-types';

const MAX_NAMED_PLATFORMS = 2;

/** A cached list can outlive its dates, so passed ones are dropped on the phone too. */
export function omitLeftTitles<T extends { leavesAtUtc: string }>(
  items: readonly T[],
  now = Date.now(),
): T[] {
  return items.filter((item) => Date.parse(item.leavesAtUtc) > now);
}

export function flattenLeavingSoonPages(
  pages: readonly LeavingSoonResponse[] | undefined,
  now = Date.now(),
): LeavingSoonItem[] {
  const byKey = new Map<string, LeavingSoonItem>();

  for (const page of pages ?? []) {
    for (const item of omitLeftTitles(page.items, now)) {
      byKey.set(`${item.type}:${item.id}`, item);
    }
  }

  return [...byKey.values()];
}

/** Last day in the device time zone, e.g. "27 November". */
export function formatLeavingDay(leavesAtUtc: string, month: 'short' | 'long' = 'long'): string {
  return new Date(leavesAtUtc).toLocaleDateString(getUiFormatLocaleTag(), {
    day: 'numeric',
    month,
  });
}

export function formatLeavingLastDay(leavesAtUtc: string, month: 'short' | 'long' = 'long'): string {
  return i18n.t('leavingSoon.lastDay', { date: formatLeavingDay(leavesAtUtc, month) });
}

export function formatLeavingPlatforms(platforms: readonly LeavingSoonPlatform[]): string {
  const names = platforms.slice(0, MAX_NAMED_PLATFORMS).map((platform) => platform.name);
  const rest = platforms.length - names.length;

  return rest > 0 ? `${names.join(' · ')} +${rest}` : names.join(' · ');
}

function toHomeItem(item: LeavingSoonItem): HomeItem {
  return {
    id: item.id,
    contentType: item.type,
    title: item.title,
    originalTitle: item.originalTitle,
    posterUrl: item.posterUrl,
    backdropUrl: item.backdropUrl,
    releaseDate: item.releaseDate,
    voteAverage: item.voteAverage,
    voteCount: item.voteCount,
    leaving: {
      leavesAtUtc: item.leavesAtUtc,
      platforms: item.platforms
        .slice(0, MAX_NAMED_PLATFORMS)
        .map(({ serviceId, name }) => ({ serviceId, name })),
    },
  };
}

/** The Home rail, or null when too few titles are still available. */
export function buildLeavingSoonSection(
  items: readonly LeavingSoonItem[] | undefined,
  now = Date.now(),
): HomeSection | null {
  const upcoming = omitLeftTitles(items ?? [], now);

  if (upcoming.length < LEAVING_SOON_RAIL_MINIMUM) {
    return null;
  }

  return {
    type: 'LeavingSoon',
    title: 'Leaving Soon',
    items: upcoming.map(toHomeItem),
    displayOrder: 0,
  };
}
