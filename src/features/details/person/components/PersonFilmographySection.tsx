import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
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
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvingKeyRef = useRef<string | null>(null);
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            : t('details.sections.filmographyOpenError'),
        );
      } finally {
        resolvingKeyRef.current = null;
        setResolvingKey(null);
      }
    },
    [queryClient, router, t],
  );

  if (filmography.length === 0) {
    return (
      <View style={styles.container} testID="person-filmography-empty">
        <HomeSectionHeader title={t('details.sections.filmography')} />
        <AppText variant="bodySmall" muted style={styles.empty}>
          {t('details.sections.knownForEmpty')}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="person-filmography">
      <HomeSectionHeader title={t('details.sections.filmography')} />
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
