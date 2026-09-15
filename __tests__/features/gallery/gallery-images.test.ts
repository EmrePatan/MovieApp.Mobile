import { createGalleryImageFromPath } from '@/features/gallery/utils/gallery-images';

describe('createGalleryImageFromPath', () => {
  it('creates a gallery image with poster category', () => {
    expect(createGalleryImageFromPath('/poster.jpg', 'poster')).toEqual({
      filePath: '/poster.jpg',
      width: null,
      height: null,
      aspectRatio: null,
      category: 'poster',
      language: null,
      voteAverage: 0,
      voteCount: 0,
    });
  });
});
