import { normalizeGalleryResponse } from '@/features/gallery/api/normalize-gallery-response';

describe('normalizeGalleryResponse', () => {
  it('normalizes camelCase gallery payloads', () => {
    const normalized = normalizeGalleryResponse({
      backdrops: [{ filePath: '/backdrop.jpg', voteAverage: 8, voteCount: 2 }],
      posters: [],
      logos: [],
      profiles: [],
    });

    expect(normalized.backdrops).toHaveLength(1);
    expect(normalized.backdrops[0]?.filePath).toBe('/backdrop.jpg');
  });

  it('normalizes pascalCase gallery payloads', () => {
    const normalized = normalizeGalleryResponse({
      Backdrops: [{ FilePath: '/backdrop.jpg', VoteAverage: 8, VoteCount: 2 }],
      Posters: [{ FilePath: '/poster.jpg', VoteAverage: 7, VoteCount: 1 }],
      Logos: [],
      Profiles: [],
    });

    expect(normalized.backdrops[0]?.filePath).toBe('/backdrop.jpg');
    expect(normalized.posters[0]?.filePath).toBe('/poster.jpg');
  });

  it('returns empty arrays for missing collections', () => {
    const normalized = normalizeGalleryResponse({});

    expect(normalized.backdrops).toEqual([]);
    expect(normalized.posters).toEqual([]);
    expect(normalized.logos).toEqual([]);
    expect(normalized.profiles).toEqual([]);
  });
});
