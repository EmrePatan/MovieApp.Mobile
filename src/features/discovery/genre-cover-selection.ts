import type { SearchResultItem } from '@/features/search/types';

/** Popular titles requested per genre from the existing browse API. */
export const GENRE_COVER_CANDIDATE_PAGE_SIZE = 20;

/** Use the Nth popular title poster per genre (1 = first result). */
export const GENRE_COVER_PREFERRED_RANK = 2;

export interface GenreCoverCandidate {
  id: string;
  title: string;
  posterUrl: string | null;
}

export interface GenreCoverSource {
  isLoading: boolean;
  candidates: readonly GenreCoverCandidate[];
}

export type GenreCoverSlot =
  | { status: 'pending' }
  | { status: 'fallback' }
  | { status: 'poster'; titleId: string; title: string; posterUrl: string };

function normalizeCoverTitle(title: string): string {
  return title.trim().toLowerCase();
}

export function genreCoverCandidatesFromItems(
  items: readonly SearchResultItem[] | undefined,
): GenreCoverCandidate[] {
  if (!items) {
    return [];
  }

  const candidates: GenreCoverCandidate[] = [];
  for (const item of items) {
    if (item.type === 'person') {
      continue;
    }

    const id = item.id.trim();
    const title = item.title.trim();
    if (!id || !title) {
      continue;
    }

    candidates.push({
      id,
      title,
      posterUrl: item.posterUrl,
    });
  }

  return candidates;
}

/**
 * Walk genres in order. Each genre takes the preferred-rank unused poster title.
 * An earlier genre that is still loading keeps later genres pending so a title
 * is not shown twice and then swapped. A genre with no remaining poster falls back.
 */
export function resolveGenreCoverSlots(
  genres: readonly { id: string }[],
  sourcesByGenreId: ReadonlyMap<string, GenreCoverSource>,
): Map<string, GenreCoverSlot> {
  const slots = new Map<string, GenreCoverSlot>();
  const usedTitleKeys = new Set<string>();
  const usedIds = new Set<string>();
  let earlierPending = false;

  for (const genre of genres) {
    if (earlierPending) {
      slots.set(genre.id, { status: 'pending' });
      continue;
    }

    const source = sourcesByGenreId.get(genre.id);
    if (!source || source.isLoading) {
      earlierPending = true;
      slots.set(genre.id, { status: 'pending' });
      continue;
    }

    const cover = pickUnusedCover(source.candidates, usedTitleKeys, usedIds);
    slots.set(genre.id, cover ?? { status: 'fallback' });
  }

  return slots;
}

function pickUnusedCover(
  candidates: readonly GenreCoverCandidate[],
  usedTitleKeys: Set<string>,
  usedIds: Set<string>,
): GenreCoverSlot | null {
  const skipBeforeRank = Math.max(0, GENRE_COVER_PREFERRED_RANK - 1);
  let eligibleRank = 0;

  for (const candidate of candidates) {
    const titleKey = normalizeCoverTitle(candidate.title);
    const posterUrl = candidate.posterUrl?.trim() ?? '';
    if (!titleKey || !posterUrl) {
      continue;
    }

    if (eligibleRank < skipBeforeRank) {
      eligibleRank += 1;
      continue;
    }

    if (usedIds.has(candidate.id) || usedTitleKeys.has(titleKey)) {
      continue;
    }

    usedIds.add(candidate.id);
    usedTitleKeys.add(titleKey);
    return {
      status: 'poster',
      titleId: candidate.id,
      title: candidate.title.trim(),
      posterUrl,
    };
  }

  return null;
}
