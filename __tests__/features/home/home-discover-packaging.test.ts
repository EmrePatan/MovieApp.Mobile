import {
  appendMissingHomeCatalogRails,
  omitHomeRailsForTypeFilter,
} from '@/features/home/utils/append-missing-home-catalog-rails';
import { resolveComingUpSeeAllTab } from '@/features/home/utils/coming-up-source';
import { DISCOVER_RAIL_CATALOG } from '@/features/discovery/discover-rail-catalog';
import {
  resolveDiscoverGenreCanonicalName,
  selectDiscoverHubGenres,
  selectMainDiscoverGenres,
} from '@/features/discovery/main-discover-genres';
import { parseDiscoverParams } from '@/features/discovery/utils/discover-params';
import type { HomeItem, HomeSection } from '@/features/home/types';

function item(id: string, contentType: HomeItem['contentType']): HomeItem {
  return {
    id,
    contentType,
    title: id,
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7,
    voteCount: 10,
  };
}

function section(type: HomeSection['type'], items: HomeItem[]): HomeSection {
  return { type, title: type, items, displayOrder: 1 };
}

describe('home and discover packaging', () => {
  it('pins Coming Up See All to for-you unless the rail is the upcoming catalog', () => {
    expect(resolveComingUpSeeAllTab('for-you')).toBe('for-you');
    expect(resolveComingUpSeeAllTab('personalized')).toBe('for-you');
    expect(resolveComingUpSeeAllTab(undefined)).toBe('for-you');
    expect(resolveComingUpSeeAllTab('upcoming')).toBe('upcoming');
    expect(resolveComingUpSeeAllTab('catalog')).toBe('upcoming');
  });

  it('adds missing On TV and theaters rails and keeps movie or TV titles only', () => {
    const appended = appendMissingHomeCatalogRails(
      [section('Trending', [item('trend', 'movie')])],
      {
        onTvItems: [item('show', 'tv'), item('film', 'movie')],
        nowInTheatersItems: [item('cinema', 'movie'), item('series', 'tv')],
      },
    );

    expect(appended.map((entry) => entry.type)).toEqual([
      'Trending',
      'OnTvThisWeek',
      'NowInTheaters',
    ]);
    expect(appended[1]?.items.map((entry) => entry.id)).toEqual(['show']);
    expect(appended[2]?.items.map((entry) => entry.id)).toEqual(['cinema']);
  });

  it('does not duplicate catalog rails the home payload already includes', () => {
    const appended = appendMissingHomeCatalogRails(
      [section('OnTvThisWeek', [item('show', 'tv')])],
      { onTvItems: [item('other', 'tv')] },
    );

    expect(appended).toHaveLength(1);
    expect(appended[0]?.items[0]?.id).toBe('show');
  });

  it('hides On TV for a movie filter and theaters for a TV filter', () => {
    const sections = [
      section('OnTvThisWeek', [item('show', 'tv')]),
      section('NowInTheaters', [item('cinema', 'movie')]),
    ];

    expect(omitHomeRailsForTypeFilter(sections, 'movie').map((entry) => entry.type)).toEqual([
      'NowInTheaters',
    ]);
    expect(omitHomeRailsForTypeFilter(sections, 'tv').map((entry) => entry.type)).toEqual([
      'OnTvThisWeek',
    ]);
  });

  it('keeps Keşfet rails off the general trend list and shows main genres only', () => {
    expect(DISCOVER_RAIL_CATALOG).toEqual([
      'platforms',
      'genres',
      'world-cinema',
      'hidden-gems',
      'popular',
      'new-releases',
      'top-rated',
    ]);
    expect(DISCOVER_RAIL_CATALOG).not.toContain('trending');

    expect(
      selectMainDiscoverGenres([
        { id: 'news', name: 'News' },
        { id: 'drama', name: 'Drama' },
        { id: 'action', name: 'Action' },
      ]).map((genre) => genre.name),
    ).toEqual(['Action', 'Drama']);
  });

  it('selects the main Keşfet genres when /genres returns Turkish names', () => {
    const selected = selectMainDiscoverGenres([
      { id: 'news', name: 'Haber' },
      { id: 'doc', name: 'Belgesel' },
      { id: 'thriller', name: 'Gerilim' },
      { id: 'scifi', name: 'Bilim Kurgu' },
      { id: 'romance', name: 'Romantik' },
      { id: 'mystery', name: 'Gizem' },
      { id: 'horror', name: 'Korku' },
      { id: 'fantasy', name: 'Fantastik' },
      { id: 'drama', name: 'Dram' },
      { id: 'crime', name: 'Suç' },
      { id: 'comedy', name: 'Komedi' },
      { id: 'animation', name: 'Animasyon' },
      { id: 'adventure', name: 'Macera' },
      { id: 'action', name: 'Aksiyon' },
    ]);

    expect(selected.map((genre) => genre.id)).toEqual([
      'action',
      'adventure',
      'animation',
      'comedy',
      'crime',
      'drama',
      'fantasy',
      'horror',
      'mystery',
      'romance',
      'scifi',
      'thriller',
    ]);
    expect(selected.map((genre) => genre.name)).not.toContain('Haber');
    expect(resolveDiscoverGenreCanonicalName('Aksiyon')).toBe('Action');
    expect(resolveDiscoverGenreCanonicalName('Bilim Kurgu')).toBe('Science Fiction');
    expect(resolveDiscoverGenreCanonicalName('Liebesfilm')).toBe('Romance');
    expect(resolveDiscoverGenreCanonicalName('Fantascienza')).toBe('Science Fiction');
    expect(resolveDiscoverGenreCanonicalName('Ficção científica')).toBe('Science Fiction');
  });

  it('keeps a genres rail when returned names are outside the main set', () => {
    const returned = [{ id: 'local', name: 'Yerel Tür' }];

    expect(selectMainDiscoverGenres(returned)).toEqual([]);
    expect(selectDiscoverHubGenres(returned)).toEqual(returned);
  });

  it('accepts the hidden-gems slug on See All', () => {
    expect(parseDiscoverParams({ mode: 'hidden-gems', type: 'all' }).mode).toBe('hidden_gems');
    expect(parseDiscoverParams({ mode: 'popular', type: 'all' }).mode).toBe('popular');
  });
});
