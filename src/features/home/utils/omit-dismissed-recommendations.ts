import type { HomeItem, HomeSection } from '../types';

export function getHomeRecommendationDismissKey(
  item: Pick<HomeItem, 'contentType' | 'id'>,
): string {
  return `${item.contentType}:${item.id}`;
}

/**
 * Removes titles the user marked "not interested" from personalized rails only.
 * Other rails (trending, new releases, ...) keep the title, so a dismissal stays scoped to recommendations.
 */
export function omitDismissedRecommendations(
  sections: HomeSection[],
  dismissedKeys: ReadonlySet<string>,
): HomeSection[] {
  if (dismissedKeys.size === 0) {
    return sections;
  }

  return sections.map((section) => {
    if (section.type !== 'RecommendedForYou') {
      return section;
    }

    const items = section.items.filter(
      (item) => !dismissedKeys.has(getHomeRecommendationDismissKey(item)),
    );

    return items.length === section.items.length ? section : { ...section, items };
  });
}
