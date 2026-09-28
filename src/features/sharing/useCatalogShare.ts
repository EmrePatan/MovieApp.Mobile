import { useCallback } from 'react';
import { Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import { buildCatalogShareMessage, type BuildCatalogShareMessageInput } from './build-catalog-share-message';

type CatalogShareInput = Omit<BuildCatalogShareMessageInput, 't'>;

export function useCatalogShare() {
  const { t } = useTranslation();

  return useCallback(
    async (input: CatalogShareInput) => {
      const { message, url } = buildCatalogShareMessage({ ...input, t });
      trackProductMetric(PRODUCT_METRICS.detailShareOpened);

      await Share.share({
        message,
        url,
        title: input.title,
      });
    },
    [t],
  );
}
