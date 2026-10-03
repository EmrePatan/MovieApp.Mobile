import {
  HOME_COMING_UP_RAIL_SIZE,
  selectHomeComingUpRailItems,
} from '@/features/home/utils/home-coming-up-rail-items';
import type { HomeItem } from '@/features/home/types';

function item(id: string, posterUrl: string | null): HomeItem {
  return {
    id,
    contentType: 'movie',
    title: id,
    originalTitle: null,
    posterUrl,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 0,
    voteCount: 0,
  };
}

describe('selectHomeComingUpRailItems', () => {
  it('keeps only items with a poster and caps at the rail size', () => {
    const items = [
      item('a', '/a.jpg'),
      item('b', null),
      item('c', ' '),
      item('d', '/d.jpg'),
      item('e', '/e.jpg'),
      item('f', '/f.jpg'),
      item('g', '/g.jpg'),
      item('h', '/h.jpg'),
      item('i', '/i.jpg'),
      item('j', '/j.jpg'),
      item('k', '/k.jpg'),
      item('l', '/l.jpg'),
      item('m', '/m.jpg'),
    ];

    expect(selectHomeComingUpRailItems(items)).toEqual([
      item('a', '/a.jpg'),
      item('d', '/d.jpg'),
      item('e', '/e.jpg'),
      item('f', '/f.jpg'),
      item('g', '/g.jpg'),
      item('h', '/h.jpg'),
      item('i', '/i.jpg'),
      item('j', '/j.jpg'),
      item('k', '/k.jpg'),
      item('l', '/l.jpg'),
    ]);
    expect(selectHomeComingUpRailItems(items)).toHaveLength(HOME_COMING_UP_RAIL_SIZE);
  });
});
