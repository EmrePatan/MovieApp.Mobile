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

function getGalleryImageDtos(
  gallery: GalleryResponse,
  category: 'backdrops' | 'posters',
): GalleryImageDto[] {
  const images = gallery[category];
  return Array.isArray(images) ? images : [];
}

export function getMovieTvGalleryImages(
  gallery: GalleryResponse,
  filter: GalleryFilter,
): GalleryImage[] {
  if (filter === 'backdrops') {
    return getGalleryImageDtos(gallery, 'backdrops').map((image) => toGalleryImage(image, 'backdrop'));
  }

  if (filter === 'posters') {
    return getGalleryImageDtos(gallery, 'posters').map((image) => toGalleryImage(image, 'poster'));
  }

  return [
    ...getGalleryImageDtos(gallery, 'backdrops').map((image) => toGalleryImage(image, 'backdrop')),
    ...getGalleryImageDtos(gallery, 'posters').map((image) => toGalleryImage(image, 'poster')),
  ];
}

export function getMovieTvPreviewImages(gallery: GalleryResponse): GalleryImage[] {
  const backdrops = getMovieTvGalleryImages(gallery, 'backdrops');
  const posters = getMovieTvGalleryImages(gallery, 'posters');

  return getGalleryPreviewImages([...backdrops, ...posters]);
}

export function getPersonGalleryImages(gallery: GalleryResponse): GalleryImage[] {
  const profiles = Array.isArray(gallery.profiles) ? gallery.profiles : [];

  return profiles.map((image) => toGalleryImage(image, 'profile'));
}

export function getGalleryPreviewImages(images: GalleryImage[]): GalleryImage[] {
  return images.slice(0, GALLERY_PREVIEW_COUNT);
}

export function galleryImageKey(image: GalleryImage, index: number): string {
  return `${image.category}-${image.filePath}-${index}`;
}

export function createGalleryImageFromPath(
  filePath: string,
  category: GalleryImage['category'],
): GalleryImage {
  return {
    filePath,
    width: null,
    height: null,
    aspectRatio: null,
    category,
    language: null,
    voteAverage: 0,
    voteCount: 0,
  };
}
