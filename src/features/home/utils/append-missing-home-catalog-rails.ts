import type { HomeItem, HomeSection, HomeSectionType, HomeTypeFilter } from '../types';

export function homeResponseIncludesSection(
  sections: readonly HomeSection[],
  type: HomeSectionType,
): boolean {
  return sections.some((section) => section.type === type);
}

function withContentType(
  items: readonly HomeItem[],
  contentType: HomeItem['contentType'],
): HomeItem[] {
  return items.filter((item) => item.contentType === contentType);
}

/**
 * Drops rails the active Home type filter cannot show, and keeps On TV / theaters
 * to their own media type when an older payload mixes titles in.
 */
export function omitHomeRailsForTypeFilter(
  sections: readonly HomeSection[],
  type: HomeTypeFilter,
): HomeSection[] {
  const next: HomeSection[] = [];

  for (const section of sections) {
    if (type === 'movie' && section.type === 'OnTvThisWeek') {
      continue;
    }

    if (type === 'tv' && section.type === 'NowInTheaters') {
      continue;
    }

    if (section.type === 'OnTvThisWeek') {
      const items = withContentType(section.items, 'tv');
      if (items.length > 0) {
        next.push({ ...section, items });
      }
      continue;
    }

    if (section.type === 'NowInTheaters') {
      const items = withContentType(section.items, 'movie');
      if (items.length > 0) {
        next.push({ ...section, items });
      }
      continue;
    }

    next.push(section);
  }

  return next;
}

export function appendMissingHomeCatalogRails(
  sections: readonly HomeSection[],
  options: {
    onTvItems?: readonly HomeItem[];
    nowInTheatersItems?: readonly HomeItem[];
  },
): HomeSection[] {
  const next = [...sections];

  if (!homeResponseIncludesSection(next, 'OnTvThisWeek')) {
    const items = withContentType(options.onTvItems ?? [], 'tv');
    if (items.length > 0) {
      next.push({
        type: 'OnTvThisWeek',
        title: 'On TV This Week',
        items,
        displayOrder: 0,
      });
    }
  }

  if (!homeResponseIncludesSection(next, 'NowInTheaters')) {
    const items = withContentType(options.nowInTheatersItems ?? [], 'movie');
    if (items.length > 0) {
      next.push({
        type: 'NowInTheaters',
        title: 'Now in Theaters',
        items,
        displayOrder: 0,
      });
    }
  }

  return next;
}
