import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppText } from '@/components/common/AppText';
import { DetailHero } from '@/features/details/shared/components/DetailHero';
import { DetailOverview } from '@/features/details/shared/components/DetailSections';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import type { CollectionDetailResponse, CollectionPart } from '../types';
import { CollectionPartRow } from './CollectionPartRow';
import { spacing } from '@/theme/spacing';

interface CollectionDetailContentProps {
  collection: CollectionDetailResponse;
}

export function CollectionDetailContent({ collection }: CollectionDetailContentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handlePartPress = useCallback(
    (part: CollectionPart) => {
      prefetchCatalogDetail(queryClient, part.id, 'movie');
      router.push(buildCatalogDetailRoute(part.id, 'movie'));
    },
    [queryClient, router],
  );

  return (
    <View>
      <DetailHero
        title={collection.name}
        posterPath={collection.posterPath}
        backdropPath={collection.backdropPath}
        metadataLine=""
        posterAccessibilityLabel={t('details.sections.collectionPoster', { name: collection.name })}
      />
      <DetailOverview overview={collection.overview} />
      <View style={styles.section} testID="collection-parts">
        <HomeSectionHeader title={t('details.sections.collectionParts')} />
        {collection.parts.length === 0 ? (
          <AppText variant="bodySmall" muted style={styles.empty} testID="collection-parts-empty">
            {t('details.sections.collectionEmpty')}
          </AppText>
        ) : (
          <View style={styles.list}>
            {collection.parts.map((part) => (
              <CollectionPartRow key={part.id} part={part} onPress={handlePartPress} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  empty: {
    paddingHorizontal: spacing.lg,
  },
});
