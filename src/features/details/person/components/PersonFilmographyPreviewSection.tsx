import { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { buildPersonFilmographyRoute } from '@/features/details/shared/routes';
import { openCatalogDetailFromFilmography } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import type { PersonFilmographyEntry } from '../types';
import { PersonFilmographyPreviewCard } from './PersonFilmographyPreviewCard';

export const FILMOGRAPHY_PREVIEW_LIMIT = 10;

interface PersonFilmographyPreviewSectionProps {
  tmdbPersonId: number;
  filmography: PersonFilmographyEntry[];
}

export function PersonFilmographyPreviewSection({
  tmdbPersonId,
  filmography,
}: PersonFilmographyPreviewSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvingKeyRef = useRef<string | null>(null);
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previewItems = filmography.slice(0, FILMOGRAPHY_PREVIEW_LIMIT);

  const handlePress = useCallback(
    async (entry: PersonFilmographyEntry) => {
      const entryKey = `${entry.mediaType}-${entry.tmdbId}`;
      if (resolvingKeyRef.current) {
        return;
      }

      setErrorMessage(null);
      resolvingKeyRef.current = entryKey;
      setResolvingKey(entryKey);

      try {
        await openCatalogDetailFromFilmography(router, entry, { queryClient });
      } catch (error) {
        setErrorMessage(
          isApiError(error)
            ? error.userMessage
            : 'Could not open this title right now. Please try again.',
        );
      } finally {
        resolvingKeyRef.current = null;
        setResolvingKey(null);
      }
    },
    [queryClient, router],
  );

  const handleSeeAllPress = useCallback(() => {
    router.push(buildPersonFilmographyRoute(tmdbPersonId));
  }, [router, tmdbPersonId]);

  if (filmography.length === 0) {
    return (
      <View style={styles.container} testID="person-filmography-empty">
        <HomeSectionHeader title="Known For" />
        <AppText variant="bodySmall" muted style={styles.empty}>
          No acting credits are available yet.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="person-filmography-preview">
      <HomeSectionHeader
        title="Known For"
        onSeeAllPress={filmography.length > FILMOGRAPHY_PREVIEW_LIMIT ? handleSeeAllPress : undefined}
      />
      <FeedbackMessage
        message={errorMessage}
        tone="error"
        onDismiss={() => setErrorMessage(null)}
      />
      <FlatList
        horizontal
        data={previewItems}
        keyExtractor={(entry) => `${entry.mediaType}-${entry.tmdbId}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={FILMOGRAPHY_PREVIEW_LIMIT}
        maxToRenderPerBatch={layout.horizontalList.maxToRenderPerBatch}
        windowSize={layout.horizontalList.windowSize}
        renderItem={({ item }) => {
          const entryKey = `${item.mediaType}-${item.tmdbId}`;

          return (
            <PersonFilmographyPreviewCard
              entry={item}
              busy={resolvingKey === entryKey}
              onPress={handlePress}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.md,
  },
  empty: {
    paddingHorizontal: spacing.lg,
  },
});
