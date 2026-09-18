/**
 * Playful Movie DNA hero titles for every TMDB genre name used in MovieApp.
 * Keys are normalized with trim + lowercase.
 */
export const MOVIE_DNA_GENRE_DISPLAY_TITLES: Record<string, string> = {
  action: 'Action Aficionado',
  adventure: 'Adventure Addict',
  'action & adventure': 'Epic Escapist',
  animation: 'Animation Devotee',
  comedy: 'Comedy Connoisseur',
  crime: 'Crime Sleuth',
  documentary: 'Truth Seeker',
  drama: 'Drama Queen',
  family: 'Family Night Regular',
  fantasy: 'Fantasy Wanderer',
  history: 'History Buff',
  horror: 'Horror Hunter',
  kids: 'Kids Corner Captain',
  music: 'Music Lover',
  mystery: 'Mystery Solver',
  news: 'Headline Hunter',
  reality: 'Reality Regular',
  romance: 'Hopeless Romantic',
  'science fiction': 'Sci-Fi Explorer',
  'sci-fi': 'Sci-Fi Explorer',
  'sci-fi & fantasy': 'Realm Wanderer',
  soap: 'Soap Saga Fan',
  talk: 'Talk Show Devotee',
  'tv movie': 'Couch Cinema Fan',
  thriller: 'Thriller Chaser',
  war: 'War Story Buff',
  'war & politics': 'Power Play Watcher',
  western: 'Western Wanderer',
};

/** Canonical genre names from MovieApp TMDB maps (movie + TV). */
export const MOVIE_DNA_KNOWN_GENRE_NAMES = [
  'Action',
  'Adventure',
  'Action & Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Kids',
  'Music',
  'Mystery',
  'News',
  'Reality',
  'Romance',
  'Science Fiction',
  'Sci-Fi',
  'Sci-Fi & Fantasy',
  'Soap',
  'Talk',
  'TV Movie',
  'Thriller',
  'War',
  'War & Politics',
  'Western',
] as const;

export function normalizeMovieDnaGenreName(name: string): string {
  return name.trim().toLowerCase();
}

export function resolveMovieDnaGenreDisplayTitle(genreName: string): string {
  const mappedTitle = MOVIE_DNA_GENRE_DISPLAY_TITLES[normalizeMovieDnaGenreName(genreName)];
  if (mappedTitle) {
    return mappedTitle;
  }

  return `${genreName.trim()} Explorer`;
}
