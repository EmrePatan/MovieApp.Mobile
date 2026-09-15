import {
  getGalleryPreviewImages,
  getMovieTvGalleryImages,
  getMovieTvPreviewImages,
  getPersonGalleryImages,
  GALLERY_PREVIEW_COUNT,
} from '@/features/gallery/utils/gallery-images';
import type { GalleryResponse } from '@/features/gallery/types';

const sampleGallery: GalleryResponse = {
  backdrops: [
    {
      filePath: '/backdrop.jpg',
      width: 1920,
      height: 1080,
      aspectRatio: 1.778,
      language: null,
      voteAverage: 8,
      voteCount: 20,
    },
  ],
  posters: [
    {
      filePath: '/poster.jpg',
      width: 1000,
      height: 1500,
      aspectRatio: 0.667,
      language: 'en',
      voteAverage: 7,
      voteCount: 10,
    },
  ],
  logos: [],
  profiles: [
    {
      filePath: '/profile.jpg',
      width: 800,
      height: 1200,
      aspectRatio: 0.667,
      language: null,
      voteAverage: 6,
      voteCount: 5,
    },
  ],
};

describe('gallery utils', () => {
  it('combines movie and tv gallery images for all filter', () => {
    const images = getMovieTvGalleryImages(sampleGallery, 'all');
    expect(images).toHaveLength(2);
  });

  it('filters backdrops and posters', () => {
    expect(getMovieTvGalleryImages(sampleGallery, 'backdrops')).toHaveLength(1);
    expect(getMovieTvGalleryImages(sampleGallery, 'posters')).toHaveLength(1);
  });

  it('returns profile images for person gallery', () => {
    expect(getPersonGalleryImages(sampleGallery)).toHaveLength(1);
  });

  it('prefers backdrops before posters in preview', () => {
    const preview = getMovieTvPreviewImages(sampleGallery);

    expect(preview[0]?.category).toBe('backdrop');
    expect(preview[1]?.category).toBe('poster');
  });

  it('limits preview images', () => {
    const manyImages = Array.from({ length: 12 }, (_, index) => ({
      filePath: `/image-${index}.jpg`,
      width: 1000,
      height: 1500,
      aspectRatio: 0.667,
      category: 'poster' as const,
      language: null,
      voteAverage: 5,
      voteCount: 1,
    }));

    expect(getGalleryPreviewImages(manyImages)).toHaveLength(GALLERY_PREVIEW_COUNT);
  });
});
