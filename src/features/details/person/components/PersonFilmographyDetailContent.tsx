import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { openCatalogDetailFromFilmography } from '@/features/details/shared/navigation/catalog-detail-navigation';
import type { PersonDetailResponse, PersonFilmographyEntry } from '../types';
import { FilmographyFilterTabs, type FilmographyFilter } from './FilmographyFilterTabs';
import { PersonFilmographyGridCard } from './PersonFilmographyGridCard';
import {
  getPersonFilmographyScrollOffset,
  setPersonFilmographyScrollOffset,
} from '../utils/person-filmography-scroll-state';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const GRID_COLUMNS = 2;
const GRID_GAP = spacing.md;

interface PersonFilmographyDetailContentProps {
  person: PersonDetailResponse;
}

function filterFilmography(
  filmography: PersonFilmographyEntry[],
  filter: FilmographyFilter,
): PersonFilmographyEntry[] {
  if (filter === 'movies') {
    return filmography.filter((entry) => entry.mediaType === 'movie');
  }

  if (filter === 'tv') {
    return filmography.filter((entry) => entry.mediaType === 'tv');
  }

  return filmography;
}

export function PersonFilmographyDetailContent({ person }: PersonFilmographyDetailContentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const resolvingKeyRef = useRef<string | null>(null);
  const listRef = useRef<FlatList<PersonFilmographyEntry>>(null);
  const [activeFilter, setActiveFilter] = useState<FilmographyFilter>('all');
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const itemWidth = (width - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const filteredFilmography = useMemo(
    () => filterFilmography(person.filmography, activeFilter),
    [activeFilter, person.filmography],
  );

  useFocusEffect(
    useCallback(() => {
      const offset = getPersonFilmographyScrollOffset(person.tmdbId);
      if (offset <= 0) {
        return;
      }

      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset, animated: false });
      });
    }, [person.tmdbId]),
  );

  const handleScroll = useCallback(
    (offset: number) => {
      setPersonFilmographyScrollOffset(person.tmdbId, offset);
    },
    [person.tmdbId],
  );

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

  const listHeader = (
    <View>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <DetailBackButton contentInset={false} />
        <View style={styles.header}>
          <AppText variant="title" style={styles.headerTitle}>
            {t('details.sections.filmography')}
          </AppText>
          <AppText variant="bodySmall" muted numberOfLines={2}>
            {person.name}
          </AppText>
        </View>
      </SafeAreaView>
      <FilmographyFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <FeedbackMessage
        message={errorMessage}
        tone="error"
        onDismiss={() => setErrorMessage(null)}
      />
    </View>
  );

  if (filteredFilmography.length === 0) {
    return (
      <View style={styles.container} testID="person-filmography-detail-empty">
        {listHeader}
        <AppText variant="bodySmall" muted style={styles.empty}>
          {t('library.watchlistDetail.filteredEmpty.all')}
        </AppText>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={filteredFilmography}
      keyExtractor={(entry) => `${entry.mediaType}-${entry.tmdbId}`}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      ListHeaderComponent={listHeader}
      testID="person-filmography-grid"
      onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
      renderItem={({ item }) => {
        const entryKey = `${item.mediaType}-${item.tmdbId}`;

        return (
          <View style={{ width: itemWidth }}>
            <PersonFilmographyGridCard
              entry={item}
              width={itemWidth}
              showMediaType={activeFilter === 'all'}
              busy={resolvingKey === entryKey}
              onPress={handlePress}
            />
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
