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
      const { message } = buildCatalogShareMessage({ ...input, t });
      trackProductMetric(PRODUCT_METRICS.detailShareOpened);

      // Message already includes the canonical HTTPS URL once. Passing `url` as well
      // duplicates the link in clients such as WhatsApp on iOS.
      await Share.share({
        message,
        title: input.title,
      });
    },
    [t],
  );
}
