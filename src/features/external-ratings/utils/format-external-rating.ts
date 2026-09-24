import type { ExternalRatingItem } from '../types';

export function formatExternalRatingValue(rating: ExternalRatingItem): string {
  if (rating.scale === 100 && rating.value === Math.round(rating.value)) {
    return `${Math.round(rating.value)}%`;
  }

  if (rating.scale === 10) {
    return `${rating.value.toFixed(1)} / 10`;
  }

  if (rating.scale === 5) {
    return `${rating.value.toFixed(1)} / 5`;
  }

  return `${rating.value} / ${rating.scale}`;
}

export function formatRottenTomatoesScores(
  tomatometer?: ExternalRatingItem,
  popcornmeter?: ExternalRatingItem,
): string | null {
  const critics = tomatometer ? formatExternalRatingValue(tomatometer) : null;
  const audience = popcornmeter ? formatExternalRatingValue(popcornmeter) : null;

  if (critics && audience) {
    return `${critics} · ${audience}`;
  }

  return critics ?? audience;
}

function buildRottenTomatoesAccessibilityLabel(
  tomatometer?: ExternalRatingItem,
  popcornmeter?: ExternalRatingItem,
): string {
  const parts: string[] = [];

  if (tomatometer) {
    parts.push(`Tomatometer ${formatExternalRatingValue(tomatometer)}`);
  }

  if (popcornmeter) {
    parts.push(`Popcornmeter ${formatExternalRatingValue(popcornmeter)}`);
  }

  return `Rotten Tomatoes ${parts.join('. ')}`;
}

export interface ExternalRatingStandardCardModel {
  id: string;
  kind: 'standard';
  source: string;
  scoreLine: string;
  accessibilityLabel: string;
}

export interface ExternalRatingRottenTomatoesCardModel {
  id: 'rotten-tomatoes';
  kind: 'rotten-tomatoes';
  tomatometerScore: string | null;
  popcornmeterScore: string | null;
  accessibilityLabel: string;
}

export type ExternalRatingCardModel =
  | ExternalRatingStandardCardModel
  | ExternalRatingRottenTomatoesCardModel;

export function buildExternalRatingCards(ratings: ExternalRatingItem[]): ExternalRatingCardModel[] {
  const bySource = new Map(ratings.map((rating) => [rating.source, rating]));
  const cards: ExternalRatingCardModel[] = [];

  const imdb = bySource.get('imdb');
  if (imdb) {
    cards.push({
      id: 'imdb',
      kind: 'standard',
      source: 'imdb',
      scoreLine: formatExternalRatingValue(imdb),
      accessibilityLabel: `IMDb ${formatExternalRatingValue(imdb)}`,
    });
  }

  const letterboxd = bySource.get('letterboxd');
  if (letterboxd) {
    cards.push({
      id: 'letterboxd',
      kind: 'standard',
      source: 'letterboxd',
      scoreLine: formatExternalRatingValue(letterboxd),
      accessibilityLabel: `Letterboxd ${formatExternalRatingValue(letterboxd)}`,
    });
  }

  const metacritic = bySource.get('metacritic');
  if (metacritic) {
    cards.push({
      id: 'metacritic',
      kind: 'standard',
      source: 'metacritic',
      scoreLine: formatExternalRatingValue(metacritic),
      accessibilityLabel: `Metacritic ${formatExternalRatingValue(metacritic)}`,
    });
  }

  const tmdb = bySource.get('tmdb');
  if (tmdb) {
    cards.push({
      id: 'tmdb',
      kind: 'standard',
      source: 'tmdb',
      scoreLine: formatExternalRatingValue(tmdb),
      accessibilityLabel: `TMDB ${formatExternalRatingValue(tmdb)}`,
    });
  }

  const tomatometer = bySource.get('tomatometer');
  const popcornmeter = bySource.get('popcornmeter');
  if (tomatometer || popcornmeter) {
    cards.push({
      id: 'rotten-tomatoes',
      kind: 'rotten-tomatoes',
      tomatometerScore: tomatometer ? formatExternalRatingValue(tomatometer) : null,
      popcornmeterScore: popcornmeter ? formatExternalRatingValue(popcornmeter) : null,
      accessibilityLabel: buildRottenTomatoesAccessibilityLabel(tomatometer, popcornmeter),
    });
  }

  return cards;
}
