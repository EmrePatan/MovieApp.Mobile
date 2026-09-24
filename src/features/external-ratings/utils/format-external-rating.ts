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

export interface ExternalRatingCardModel {
  id: string;
  source: string;
  scoreLine: string;
  accessibilityLabel: string;
}

export function buildExternalRatingCards(ratings: ExternalRatingItem[]): ExternalRatingCardModel[] {
  const bySource = new Map(ratings.map((rating) => [rating.source, rating]));
  const cards: ExternalRatingCardModel[] = [];

  const imdb = bySource.get('imdb');
  if (imdb) {
    cards.push({
      id: 'imdb',
      source: 'imdb',
      scoreLine: formatExternalRatingValue(imdb),
      accessibilityLabel: `IMDb ${formatExternalRatingValue(imdb)}`,
    });
  }

  const tomatometer = bySource.get('tomatometer');
  const popcornmeter = bySource.get('popcornmeter');
  const rtLine = formatRottenTomatoesScores(tomatometer, popcornmeter);
  if (rtLine) {
    cards.push({
      id: 'rotten-tomatoes',
      source: 'rotten-tomatoes',
      scoreLine: rtLine,
      accessibilityLabel: `Rotten Tomatoes ${rtLine}`,
    });
  }

  const letterboxd = bySource.get('letterboxd');
  if (letterboxd) {
    cards.push({
      id: 'letterboxd',
      source: 'letterboxd',
      scoreLine: formatExternalRatingValue(letterboxd),
      accessibilityLabel: `Letterboxd ${formatExternalRatingValue(letterboxd)}`,
    });
  }

  const metacritic = bySource.get('metacritic');
  if (metacritic) {
    cards.push({
      id: 'metacritic',
      source: 'metacritic',
      scoreLine: formatExternalRatingValue(metacritic),
      accessibilityLabel: `Metacritic ${formatExternalRatingValue(metacritic)}`,
    });
  }

  const tmdb = bySource.get('tmdb');
  if (tmdb) {
    cards.push({
      id: 'tmdb',
      source: 'tmdb',
      scoreLine: formatExternalRatingValue(tmdb),
      accessibilityLabel: `TMDB ${formatExternalRatingValue(tmdb)}`,
    });
  }

  return cards;
}
