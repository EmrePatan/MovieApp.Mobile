import { getKnownForCategoryPriority } from '../known-for-category';
import type { PersonFilmographyEntry } from '../types';

export function rankFilmographyForKnownForPreview(
  filmography: readonly PersonFilmographyEntry[],
): PersonFilmographyEntry[] {
  return filmography
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => {
      const categoryDelta =
        getKnownForCategoryPriority(left.entry.knownForCategory, left.entry.mediaType) -
        getKnownForCategoryPriority(right.entry.knownForCategory, right.entry.mediaType);

      if (categoryDelta !== 0) {
        return categoryDelta;
      }

      const leftPopularity = left.entry.popularity ?? 0;
      const rightPopularity = right.entry.popularity ?? 0;

      if (leftPopularity !== rightPopularity) {
        return rightPopularity - leftPopularity;
      }

      return left.index - right.index;
    })
    .map(({ entry }) => entry);
}
