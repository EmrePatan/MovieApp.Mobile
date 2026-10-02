export const PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES = {
  movie: 'movie',
  scriptedTelevision: 'scripted_tv',
  miniSeries: 'mini_series',
  televisionMovie: 'tv_movie',
  animation: 'animation',
  documentary: 'documentary',
  talkVarietyReality: 'talk_variety_reality',
  otherTelevision: 'other_tv',
} as const;

export type PersonFilmographyKnownForCategory =
  (typeof PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES)[keyof typeof PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES];

const KNOWN_FOR_CATEGORY_PRIORITY: Record<PersonFilmographyKnownForCategory, number> = {
  [PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.movie]: 1,
  [PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.scriptedTelevision]: 2,
  [PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.miniSeries]: 3,
  [PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.televisionMovie]: 4,
  [PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.animation]: 5,
  [PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.documentary]: 6,
  [PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.talkVarietyReality]: 7,
  [PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.otherTelevision]: 8,
};

export function getKnownForCategoryPriority(
  category: PersonFilmographyKnownForCategory | string | null | undefined,
  mediaType: 'movie' | 'tv',
): number {
  if (category && category in KNOWN_FOR_CATEGORY_PRIORITY) {
    return KNOWN_FOR_CATEGORY_PRIORITY[category as PersonFilmographyKnownForCategory];
  }

  return mediaType === 'movie'
    ? KNOWN_FOR_CATEGORY_PRIORITY[PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.movie]
    : KNOWN_FOR_CATEGORY_PRIORITY[PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.scriptedTelevision];
}
