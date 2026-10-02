import { PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES } from '@/features/details/person/known-for-category';
import type { PersonFilmographyEntry } from '@/features/details/person/types';
import { rankFilmographyForKnownForPreview } from '@/features/details/person/utils/rank-filmography-for-known-for-preview';

function entry(
  overrides: Partial<PersonFilmographyEntry> & Pick<PersonFilmographyEntry, 'tmdbId' | 'mediaType' | 'title'>,
): PersonFilmographyEntry {
  return {
    catalogId: null,
    posterPath: null,
    character: 'Role',
    releaseDate: null,
    ...overrides,
  };
}

describe('rankFilmographyForKnownForPreview', () => {
  it('prioritizes movies and scripted television over talk and variety credits', () => {
    const filmography: PersonFilmographyEntry[] = [
      entry({
        mediaType: 'tv',
        tmdbId: 1,
        title: 'Late Night',
        knownForCategory: PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.talkVarietyReality,
        popularity: 200,
      }),
      entry({
        mediaType: 'movie',
        tmdbId: 2,
        title: 'Blockbuster',
        knownForCategory: PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.movie,
        popularity: 50,
      }),
      entry({
        mediaType: 'tv',
        tmdbId: 3,
        title: 'Drama Series',
        knownForCategory: PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.scriptedTelevision,
        popularity: 80,
      }),
    ];

    const ranked = rankFilmographyForKnownForPreview(filmography);

    expect(ranked.map((item) => item.tmdbId)).toEqual([2, 3, 1]);
  });

  it('uses popularity within the same category and preserves backend order as tie-breaker', () => {
    const filmography: PersonFilmographyEntry[] = [
      entry({
        mediaType: 'movie',
        tmdbId: 10,
        title: 'Smaller Hit',
        knownForCategory: PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.movie,
        popularity: 40,
      }),
      entry({
        mediaType: 'movie',
        tmdbId: 11,
        title: 'Bigger Hit',
        knownForCategory: PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.movie,
        popularity: 90,
      }),
      entry({
        mediaType: 'movie',
        tmdbId: 12,
        title: 'Same Popularity First',
        knownForCategory: PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.movie,
        popularity: 90,
      }),
    ];

    const ranked = rankFilmographyForKnownForPreview(filmography);

    expect(ranked.map((item) => item.tmdbId)).toEqual([11, 12, 10]);
  });

  it('does not mutate or drop entries from the source filmography list', () => {
    const filmography: PersonFilmographyEntry[] = [
      entry({
        mediaType: 'tv',
        tmdbId: 1,
        title: 'Talk',
        knownForCategory: PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.talkVarietyReality,
      }),
      entry({
        mediaType: 'movie',
        tmdbId: 2,
        title: 'Film',
        knownForCategory: PERSON_FILMOGRAPHY_KNOWN_FOR_CATEGORIES.movie,
      }),
    ];
    const snapshot = [...filmography];

    const ranked = rankFilmographyForKnownForPreview(filmography);

    expect(filmography).toEqual(snapshot);
    expect(ranked).toHaveLength(2);
    expect(ranked.map((item) => item.tmdbId)).toEqual([2, 1]);
  });
});
