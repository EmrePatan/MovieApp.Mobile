import type { ExternalRatingItem } from '@/features/external-ratings/types';

export function mergeCatalogTmdbRatingForRail(
  ratings: ExternalRatingItem[],
  catalogTmdbVoteAverage?: number,
): ExternalRatingItem[] {
  if (catalogTmdbVoteAverage == null || catalogTmdbVoteAverage <= 0) {
    return ratings;
  }

  if (ratings.some((rating) => rating.source === 'tmdb')) {
    return ratings;
  }

  return [
    ...ratings,
    {
      source: 'tmdb',
      value: catalogTmdbVoteAverage,
      scale: 10,
    },
  ];
}

export function formatExternalRatingRailValue(rating: ExternalRatingItem): string {
  if (rating.scale === 100 && rating.value === Math.round(rating.value)) {
    return `${Math.round(rating.value)}%`;
  }

  if (rating.scale === 10 || rating.scale === 5) {
    return rating.value.toFixed(1);
  }

  return `${rating.value.toFixed(1)}`;
}

export interface ExternalRatingRailStandardItem {
  id: string;
  kind: 'standard';
  source: string;
  valueLabel: string;
  accessibilityLabel: string;
  scorePending?: boolean;
}

export interface ExternalRatingRailRottenTomatoesItem {
  id: 'tomatometer' | 'popcornmeter';
  kind: 'rotten-tomatoes';
  rtSource: 'tomatometer' | 'popcornmeter';
  valueLabel: string;
  accessibilityLabel: string;
  scorePending?: boolean;
}

export type ExternalRatingRailItem =
  | ExternalRatingRailStandardItem
  | ExternalRatingRailRottenTomatoesItem;

export function buildExternalRatingRailItems(
  ratings: ExternalRatingItem[],
): ExternalRatingRailItem[] {
  const bySource = new Map(ratings.map((rating) => [rating.source, rating]));
  const items: ExternalRatingRailItem[] = [];

  const imdb = bySource.get('imdb');
  if (imdb) {
    const valueLabel = formatExternalRatingRailValue(imdb);
    items.push({
      id: 'imdb',
      kind: 'standard',
      source: 'imdb',
      valueLabel,
      accessibilityLabel: `IMDb ${valueLabel}`,
    });
  }

  const tmdb = bySource.get('tmdb');
  if (tmdb) {
    const valueLabel = formatExternalRatingRailValue(tmdb);
    items.push({
      id: 'tmdb',
      kind: 'standard',
      source: 'tmdb',
      valueLabel,
      accessibilityLabel: `TMDB ${valueLabel}`,
    });
  }

  const letterboxd = bySource.get('letterboxd');
  if (letterboxd) {
    const valueLabel = formatExternalRatingRailValue(letterboxd);
    items.push({
      id: 'letterboxd',
      kind: 'standard',
      source: 'letterboxd',
      valueLabel,
      accessibilityLabel: `Letterboxd ${valueLabel}`,
    });
  }

  const metacritic = bySource.get('metacritic');
  if (metacritic) {
    const valueLabel = formatExternalRatingRailValue(metacritic);
    items.push({
      id: 'metacritic',
      kind: 'standard',
      source: 'metacritic',
      valueLabel,
      accessibilityLabel: `Metacritic ${valueLabel}`,
    });
  }

  const tomatometer = bySource.get('tomatometer');
  if (tomatometer) {
    const valueLabel = formatExternalRatingRailValue(tomatometer);
    items.push({
      id: 'tomatometer',
      kind: 'rotten-tomatoes',
      rtSource: 'tomatometer',
      valueLabel,
      accessibilityLabel: `Tomatometer ${valueLabel}`,
    });
  }

  const popcornmeter = bySource.get('popcornmeter');
  if (popcornmeter) {
    const valueLabel = formatExternalRatingRailValue(popcornmeter);
    items.push({
      id: 'popcornmeter',
      kind: 'rotten-tomatoes',
      rtSource: 'popcornmeter',
      valueLabel,
      accessibilityLabel: `Popcornmeter ${valueLabel}`,
    });
  }

  return items;
}

const EXTERNAL_RAIL_DISPLAY_ORDER = [
  'imdb',
  'tmdb',
  'letterboxd',
  'metacritic',
  'tomatometer',
  'popcornmeter',
] as const;

type ExternalRailDisplaySlotId = (typeof EXTERNAL_RAIL_DISPLAY_ORDER)[number];

function createExternalRatingRailPlaceholder(
  slotId: ExternalRailDisplaySlotId,
): ExternalRatingRailItem {
  if (slotId === 'tomatometer' || slotId === 'popcornmeter') {
    const label = slotId === 'tomatometer' ? 'Tomatometer' : 'Popcornmeter';
    return {
      id: slotId,
      kind: 'rotten-tomatoes',
      rtSource: slotId,
      valueLabel: '',
      accessibilityLabel: label,
      scorePending: true,
    };
  }

  const accessibilityLabels: Record<
    Exclude<ExternalRailDisplaySlotId, 'tomatometer' | 'popcornmeter'>,
    string
  > = {
    imdb: 'IMDb',
    tmdb: 'TMDB',
    letterboxd: 'Letterboxd',
    metacritic: 'Metacritic',
  };

  return {
    id: slotId,
    kind: 'standard',
    source: slotId,
    valueLabel: '',
    accessibilityLabel: accessibilityLabels[slotId],
    scorePending: true,
  };
}

/**
 * Builds the rail row from API ratings, optionally filling missing slots with brand
 * placeholders (bundled logos + pending score) while external ratings are still loading.
 */
export function buildExternalRatingRailDisplayItems(
  ratings: ExternalRatingItem[],
  options?: {
    catalogTmdbVoteAverage?: number;
    includeScorePlaceholders?: boolean;
  },
): ExternalRatingRailItem[] {
  const merged = mergeCatalogTmdbRatingForRail(ratings, options?.catalogTmdbVoteAverage);
  const resolved = buildExternalRatingRailItems(merged);

  if (!options?.includeScorePlaceholders) {
    return resolved;
  }

  const resolvedById = new Map(resolved.map((item) => [item.id, item]));
  const items: ExternalRatingRailItem[] = [];

  for (const slotId of EXTERNAL_RAIL_DISPLAY_ORDER) {
    if (slotId === 'tmdb') {
      const hasCatalogTmdb =
        options.catalogTmdbVoteAverage != null && options.catalogTmdbVoteAverage > 0;
      if (!hasCatalogTmdb && !resolvedById.has('tmdb')) {
        continue;
      }
    }

    const existing = resolvedById.get(slotId);
    if (existing) {
      items.push(existing);
      continue;
    }

    items.push(createExternalRatingRailPlaceholder(slotId));
  }

  return items;
}
