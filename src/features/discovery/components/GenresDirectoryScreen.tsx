import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { GenreHubPosterCard, type GenreHubTileSize } from '@/features/discovery/components/GenreHubPosterCard';
import { useGenreCoverSlots } from '@/features/discovery/hooks/useGenreCoverSlots';
import { useGenres } from '@/features/discovery/hooks/useGenres';
import { selectGenreHubDirectoryGenres } from '@/features/discovery/main-discover-genres';
import type { Genre } from '@/features/discovery/types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const GRID_COLUMNS = 3;
const GRID_GAP = spacing.md;

export function GenresDirectoryScreen() {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const genresQuery = useGenres();
  const genres = useMemo(
    () => selectGenreHubDirectoryGenres(genresQuery.data ?? []),
    [genresQuery.data],
  );
  const covers = useGenreCoverSlots(genres);

  const gridLayout = useMemo(() => {
    const contentWidth = Math.min(windowWidth, layout.maxContentWidth);
    const horizontalPadding = layout.screenPaddingHorizontal;
    const innerWidth = contentWidth - horizontalPadding * 2;
    const tileWidth = (innerWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
    const tileHeight = tileWidth / layout.posterAspectRatio;

    return {
      contentWidth,
      tileWidth,
      tileHeight,
    };
  }, [windowWidth]);

  const tileSize = useMemo<GenreHubTileSize>(
    () => ({ width: gridLayout.tileWidth, height: gridLayout.tileHeight }),
    [gridLayout.tileHeight, gridLayout.tileWidth],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {t('discover.genresHub.directoryTitle')}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('discover.genresHub.directorySubtitle')}
        </AppText>
      </View>
    ),
    [t],
  );

  const renderItem = useCallback(
    ({ item }: { item: Genre }) => (
      <GenreHubPosterCard
        genre={item}
        tileSize={tileSize}
        cover={covers.get(item.id) ?? { status: 'fallback' }}
      />
    ),
    [covers, tileSize],
  );

  return (
    <StackListScreen
      testID="discover-genres-directory"
      topBar={
        <View style={styles.topBar}>
          <DetailBackButton />
        </View>
      }
    >
      {genresQuery.isLoading && genres.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={genres}
          key={gridLayout.tileWidth}
          numColumns={GRID_COLUMNS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { maxWidth: gridLayout.contentWidth, alignSelf: 'center', width: '100%' },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
