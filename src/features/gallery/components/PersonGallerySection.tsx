import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { GalleryResponse } from '../types';
import { getPersonGalleryImages } from '../utils/gallery-images';
import { GalleryPreviewSection } from './GalleryPreviewSection';

interface PersonGallerySectionProps {
  query: UseQueryResult<GalleryResponse>;
  seeAllRoute: string;
  returnHref: string;
}

export function PersonGallerySection({ query, seeAllRoute, returnHref }: PersonGallerySectionProps) {
  const images = useMemo(
    () => (query.data ? getPersonGalleryImages(query.data) : []),
    [query.data],
  );

  return (
    <GalleryPreviewSection
      title="Photos"
      images={images}
      isLoading={query.isPending && !query.isError}
      seeAllRoute={seeAllRoute}
      returnHref={returnHref}
    />
  );
}
