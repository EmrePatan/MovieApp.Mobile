import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { openCatalogDetailFromFilmography } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import type { PersonFilmographyEntry } from '../types';
import { PersonFilmographyCard } from './PersonFilmographyCard';
import { spacing } from '@/theme/spacing';

interface PersonFilmographySectionProps {
  filmography: PersonFilmographyEntry[];
}

export function PersonFilmographySection({ filmography }: PersonFilmographySectionProps) {
  const router = useRouter();
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePress = useCallback(
    async (entry: PersonFilmographyEntry) => {
      const entryKey = `${entry.mediaType}-${entry.tmdbId}`;
      if (resolvingKey) {
        return;
      }

      setErrorMessage(null);
      setResolvingKey(entryKey);

      try {
        await openCatalogDetailFromFilmography(router, entry);
      } catch (error) {
        setErrorMessage(
          isApiError(error)
            ? error.userMessage
            : 'Could not open this title right now. Please try again.',
        );
      } finally {
        setResolvingKey(null);
      }
    },
    [resolvingKey, router],
  );

  if (filmography.length === 0) {
    return (
      <View style={styles.container} testID="person-filmography-empty">
        <HomeSectionHeader title="Filmography" />
        <AppText variant="bodySmall" muted style={styles.empty}>
          No acting credits are available yet.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="person-filmography">
      <HomeSectionHeader title="Filmography" />
      <FeedbackMessage
        message={errorMessage}
        tone="error"
        onDismiss={() => setErrorMessage(null)}
      />
      <View style={styles.list}>
        {filmography.map((entry) => {
          const entryKey = `${entry.mediaType}-${entry.tmdbId}`;

          return (
            <PersonFilmographyCard
              key={entryKey}
              entry={entry}
              busy={resolvingKey === entryKey}
              onPress={handlePress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
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
