export type GalleryImageCategory = 'backdrop' | 'poster' | 'profile';

export interface GalleryImage {
  filePath: string;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  category: GalleryImageCategory;
  language: string | null;
  voteAverage: number;
  voteCount: number;
}

export interface GalleryResponse {
  backdrops: GalleryImageDto[];
  posters: GalleryImageDto[];
  logos: GalleryImageDto[];
  profiles: GalleryImageDto[];
}

export interface GalleryImageDto {
  filePath: string;
  language: string | null;
  aspectRatio: number | null;
  width: number | null;
  height: number | null;
  voteAverage: number;
  voteCount: number;
}

export type GalleryFilter = 'all' | 'backdrops' | 'posters';
