import {
  mapCollectionPartToRecommendationItem,
  sortCollectionParts,
} from '@/features/details/collection/utils/collection-part-items';
import type { CollectionPart } from '@/features/details/collection/types';

describe('collection part items', () => {
  const parts: CollectionPart[] = [
    {
      id: 'b',
      title: 'Second',
      posterPath: null,
      releaseDate: '2010-01-01',
      voteAverage: 7,
      voteCount: 10,
    },
    {
      id: 'a',
      title: 'First',
      posterPath: '/p.jpg',
      releaseDate: '2008-01-01',
      voteAverage: 8,
      voteCount: 20,
    },
  ];

  it('sorts parts by release date', () => {
    const sorted = sortCollectionParts(parts);
    expect(sorted.map((part) => part.id)).toEqual(['a', 'b']);
  });

  it('maps parts to recommendation items', () => {
    const item = mapCollectionPartToRecommendationItem(parts[1]);
    expect(item.type).toBe('movie');
    expect(item.title).toBe('First');
    expect(item.year).toBe(2008);
    expect(item.posterUrl).toContain('/p.jpg');
  });
});
