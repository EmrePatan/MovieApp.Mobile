import {
  GENRE_HUB_RAIL_GENRE_NAMES,
  GENRE_HUB_SEE_ALL_GENRE_NAMES,
  resolveDiscoverGenreCanonicalName,
  selectGenreHubDirectoryGenres,
  selectGenreHubRailGenres,
  selectMainDiscoverGenres,
} from '@/features/discovery/main-discover-genres';
import type { Genre } from '@/features/discovery/types';
import {
  genreCoverCandidatesFromItems,
  resolveGenreCoverSlots,
  type GenreCoverCandidate,
  type GenreCoverSource,
} from '@/features/discovery/genre-cover-selection';

function genre(id: string, name: string): Genre {
  return { id, name };
}

const catalog: Genre[] = [
  genre('tv-movie', 'TV Movie'),
  genre('combined-action', 'Action & Adventure'),
  genre('combined-scifi', 'Sci-Fi & Fantasy'),
  genre('combined-war', 'War & Politics'),
  genre('talk', 'Söyleşi'),
  genre('soap', 'Pembe Dizi'),
  genre('reality', 'Gerçeklik'),
  genre('news', 'Haber'),
  genre('kids', 'Çocuk'),
  genre('western', 'Kovboy'),
  genre('war-tr', 'Savaş'),
  genre('war-en', 'War'),
  genre('music', 'Müzik'),
  genre('history', 'Tarih'),
  genre('family', 'Aile'),
  genre('documentary', 'Belgesel'),
  genre('thriller', 'Thriller'),
  genre('scifi', 'Science Fiction'),
  genre('romance', 'Romance'),
  genre('mystery', 'Mystery'),
  genre('horror', 'Horror'),
  genre('fantasy', 'Fantasy'),
  genre('drama', 'Drama'),
  genre('crime', 'Crime'),
  genre('comedy', 'Comedy'),
  genre('animation', 'Animation'),
  genre('adventure', 'Adventure'),
  genre('action', 'Action'),
];

describe('genre hub selection', () => {
  it('keeps the visible rail at the eight locked genres with War instead of Adventure', () => {
    const rail = selectGenreHubRailGenres(catalog);

    expect(rail.map((item) => item.id)).toEqual([
      'action',
      'drama',
      'comedy',
      'scifi',
      'fantasy',
      'mystery',
      'romance',
      'war-tr',
    ]);
    expect(rail.map((item) => resolveDiscoverGenreCanonicalName(item.name))).toEqual([
      ...GENRE_HUB_RAIL_GENRE_NAMES,
    ]);
    expect(rail.map((item) => item.name)).not.toContain('Adventure');
    expect(rail.filter((item) => resolveDiscoverGenreCanonicalName(item.name) === 'War')).toHaveLength(
      1,
    );
  });

  it('lists every rail genre on See All once, plus the other main genres and extras', () => {
    const directory = selectGenreHubDirectoryGenres(catalog);
    const canonical = directory.map((item) => resolveDiscoverGenreCanonicalName(item.name));

    expect(canonical).toEqual([...GENRE_HUB_SEE_ALL_GENRE_NAMES]);
    expect(canonical.slice(0, 8)).toEqual([...GENRE_HUB_RAIL_GENRE_NAMES]);
    expect(canonical).toEqual(expect.arrayContaining([
      'Adventure',
      'Animation',
      'Crime',
      'Horror',
      'Thriller',
      'Documentary',
      'Family',
      'History',
      'Music',
      'Western',
      'Kids',
      'News',
      'Reality',
      'Soap',
      'Talk',
    ]));
    expect(canonical.filter((name) => name === 'War')).toHaveLength(1);
    expect(canonical).not.toContain('TV Movie');
    expect(directory.map((item) => item.name)).not.toContain('Action & Adventure');
    expect(directory.map((item) => item.name)).not.toContain('Sci-Fi & Fantasy');
    expect(directory.map((item) => item.name)).not.toContain('War & Politics');
    expect(selectMainDiscoverGenres(catalog).map((item) => item.name)).not.toContain('War');
    expect(selectMainDiscoverGenres(catalog).map((item) => item.name)).toContain('Adventure');
  });

  it('keeps a rail when returned names are outside the catalog set', () => {
    const returned = [genre('local', 'Yerel Tür')];

    expect(selectGenreHubRailGenres(returned)).toEqual(returned);
    expect(selectGenreHubDirectoryGenres(returned)).toEqual(returned);
  });
});

function source(
  candidates: GenreCoverCandidate[],
  isLoading = false,
): GenreCoverSource {
  return { isLoading, candidates };
}

function candidate(id: string, title: string, posterUrl: string | null = `/${id}.jpg`): GenreCoverCandidate {
  return { id, title, posterUrl };
}

describe('unique genre covers', () => {
  it('does not reuse a cover title when a later genre has an alternative', () => {
    const genres = [{ id: 'action' }, { id: 'drama' }, { id: 'comedy' }];
    const slots = resolveGenreCoverSlots(
      genres,
      new Map([
        [
          'action',
          source([
            candidate('spider', 'Spider-Man'),
            candidate('mad-max', 'Mad Max'),
          ]),
        ],
        [
          'drama',
          source([
            candidate('spider-2', 'spider-man'),
            candidate('notebook', 'The Notebook'),
          ]),
        ],
        [
          'comedy',
          source([
            candidate('spider-3', 'Spider-Man'),
            candidate('notebook-2', 'The Notebook'),
            candidate('barbie', 'Barbie'),
          ]),
        ],
      ]),
    );

    expect(slots.get('action')).toMatchObject({ status: 'poster', title: 'Spider-Man' });
    expect(slots.get('drama')).toMatchObject({ status: 'poster', title: 'The Notebook' });
    expect(slots.get('comedy')).toMatchObject({ status: 'poster', title: 'Barbie' });

    const titles = [...slots.values()]
      .filter((slot) => slot.status === 'poster')
      .map((slot) => slot.title.toLowerCase());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('falls back when every remaining poster title is already used', () => {
    const slots = resolveGenreCoverSlots(
      [{ id: 'action' }, { id: 'war' }],
      new Map([
        ['action', source([candidate('spider', 'Spider-Man')])],
        [
          'war',
          source([
            candidate('spider', 'Spider-Man'),
            candidate('blank', 'Dunkirk', null),
            candidate('person-shaped', '   ', '/x.jpg'),
          ]),
        ],
      ]),
    );

    expect(slots.get('action')).toMatchObject({ status: 'poster', title: 'Spider-Man' });
    expect(slots.get('war')).toEqual({ status: 'fallback' });
  });

  it('waits to assign later covers while an earlier genre is still loading', () => {
    const slots = resolveGenreCoverSlots(
      [{ id: 'action' }, { id: 'drama' }],
      new Map([
        ['action', source([candidate('spider', 'Spider-Man')], true)],
        ['drama', source([candidate('notebook', 'The Notebook')])],
      ]),
    );

    expect(slots.get('action')).toEqual({ status: 'pending' });
    expect(slots.get('drama')).toEqual({ status: 'pending' });
  });

  it('ignores people when building cover candidates', () => {
    expect(
      genreCoverCandidatesFromItems([
        {
          id: 'person-1',
          type: 'person',
          title: 'Spider-Man',
          tmdbId: 1,
          knownForDepartment: 'Acting',
          posterUrl: '/person.jpg',
        },
        {
          id: 'movie-1',
          type: 'movie',
          title: 'Spider-Man',
          originalTitle: 'Spider-Man',
          overview: '',
          posterUrl: '/spider.jpg',
          backdropUrl: null,
          releaseDate: null,
          voteAverage: 0,
          voteCount: 0,
          year: 2002,
        },
      ]),
    ).toEqual([
      { id: 'movie-1', title: 'Spider-Man', posterUrl: '/spider.jpg' },
    ]);
  });
});
