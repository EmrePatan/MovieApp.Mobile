import type { GalleryFilter, GalleryImage, GalleryImageDto, GalleryResponse } from '../types';

export const GALLERY_PREVIEW_COUNT = 6;

function toGalleryImage(dto: GalleryImageDto, category: GalleryImage['category']): GalleryImage {
  return {
    filePath: dto.filePath,
    width: dto.width,
    height: dto.height,
    aspectRatio: dto.aspectRatio,
    category,
    language: dto.language,
    voteAverage: dto.voteAverage,
    voteCount: dto.voteCount,
  };
}

export function getMovieTvGalleryImages(
  gallery: GalleryResponse,
  filter: GalleryFilter,
): GalleryImage[] {
  if (filter === 'backdrops') {
    return gallery.backdrops.map((image) => toGalleryImage(image, 'backdrop'));
  }

  if (filter === 'posters') {
    return gallery.posters.map((image) => toGalleryImage(image, 'poster'));
  }

  return [
    ...gallery.backdrops.map((image) => toGalleryImage(image, 'backdrop')),
    ...gallery.posters.map((image) => toGalleryImage(image, 'poster')),
  ];
}

export function getPersonGalleryImages(gallery: GalleryResponse): GalleryImage[] {
  return gallery.profiles.map((image) => toGalleryImage(image, 'profile'));
}

export function getGalleryPreviewImages(images: GalleryImage[]): GalleryImage[] {
  return images.slice(0, GALLERY_PREVIEW_COUNT);
}

export function galleryImageKey(image: GalleryImage, index: number): string {
  return `${image.category}-${image.filePath}-${index}`;
}
