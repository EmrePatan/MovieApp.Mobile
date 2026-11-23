import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { useMovieGallery, useTvShowGallery } from '@/features/gallery/hooks/useGallery';
import { isPersonSearchResult } from '@/features/search/types';
import { useSearchResults } from '@/features/search/hooks/useSearch';
import type { CatalogItem } from '@/models/api/catalog';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

const SEARCH_DEBOUNCE_MS = 350;

interface InsightsDnaCoverSheetProps {
  visible: boolean;
  hasCustomCover: boolean;
  onClose: () => void;
  onPick: (posterPath: string) => void;
  onReset: () => void;
}

function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [value]);
  return debounced;
}

/** Posters of one title, as a grid; the member taps the one they want. */
function PosterStep({
  item,
  onBack,
  onPick,
}: {
  item: CatalogItem;
  onBack: () => void;
  onPick: (posterPath: string) => void;
}) {
  const { t } = useTranslation();
  const movie = useMovieGallery(item.type === 'movie' ? item.id : '');
  const tv = useTvShowGallery(item.type === 'tv' ? item.id : '');
  const gallery = item.type === 'movie' ? movie : tv;
  const posters = gallery.data?.posters ?? [];

  return (
    <View style={styles.step}>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={16} color={colors.accentStrong} />
        <AppText style={styles.backText} numberOfLines={1}>
          {item.title}
        </AppText>
      </Pressable>
      <AppText variant="caption" muted>
        {t('insights.share.coverPickPoster')}
      </AppText>
      {gallery.isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : posters.length === 0 ? (
        <AppText variant="bodySmall" muted center style={styles.empty}>
          {t('insights.share.coverNoPosters')}
        </AppText>
      ) : (
        <FlatList
          data={posters}
          keyExtractor={(poster) => poster.filePath}
          numColumns={3}
          style={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: poster }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => onPick(poster.filePath)}
              style={({ pressed }) => [styles.posterCell, pressed && styles.pressed]}
            >
              <Image
                source={{ uri: resolveImageUri(poster.filePath, 'w300') ?? undefined }}
                style={styles.posterImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

/** Pick any film's poster as the Movie DNA cover: search a title, then choose from its posters. */
export function InsightsDnaCoverSheet({ visible, ...rest }: InsightsDnaCoverSheetProps) {
  const { t } = useTranslation();
  return (
    <AppBottomSheet
      visible={visible}
      onClose={rest.onClose}
      title={t('insights.share.coverTitle')}
      avoidKeyboard
      testID="insights-dna-cover-sheet"
    >
      {visible ? <CoverSheetBody {...rest} /> : null}
    </AppBottomSheet>
  );
}

function CoverSheetBody({
  hasCustomCover,
  onClose,
  onPick,
  onReset,
}: Omit<InsightsDnaCoverSheetProps, 'visible'>) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [chosen, setChosen] = useState<CatalogItem | null>(null);
  const query = useDebounced(text);
  const results = useSearchResults(query, 'all');

  const items = useMemo(
    () =>
      (results.data?.pages.flatMap((page) => page.items) ?? []).filter(
        (item): item is CatalogItem => !isPersonSearchResult(item),
      ),
    [results.data],
  );
  const searching = query.trim().length >= 2;

  return (
    <View style={styles.body}>
      {chosen ? (
        <PosterStep
          item={chosen}
          onBack={() => setChosen(null)}
          onPick={(path) => {
            onPick(path);
            onClose();
          }}
        />
      ) : (
        <>
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t('insights.share.coverSearch')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
              accessibilityLabel={t('insights.share.coverSearch')}
            />
            {text ? (
              <Pressable onPress={() => setText('')} hitSlop={8} accessibilityRole="button">
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {results.isFetching && items.length === 0 && searching ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : searching && items.length === 0 ? (
            <AppText variant="bodySmall" muted center style={styles.empty}>
              {t('insights.share.coverEmpty')}
            </AppText>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setChosen(item)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <Image
                    source={{ uri: resolveImageUri(item.posterUrl, 'w300') ?? undefined }}
                    style={styles.rowPoster}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.rowCopy}>
                    <AppText numberOfLines={1} style={styles.rowTitle}>
                      {item.title}
                    </AppText>
                    {item.year ? (
                      <AppText variant="caption" muted>
                        {item.year}
                      </AppText>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              )}
            />
          )}

          {hasCustomCover ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onReset();
                onClose();
              }}
              style={({ pressed }) => [styles.reset, pressed && styles.pressed]}
            >
              <Ionicons name="refresh" size={15} color={colors.textSecondary} />
              <AppText style={styles.resetText}>{t('insights.share.coverReset')}</AppText>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
    height: 420,
    paddingBottom: spacing.sm,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panelInput,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  rowPoster: {
    width: 40,
    height: 60,
    borderRadius: 8,
    backgroundColor: glass.panelElevated,
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  step: { flex: 1, gap: spacing.sm },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    maxWidth: '100%',
  },
  backText: { fontSize: 14, fontWeight: '700', color: colors.accentStrong, flexShrink: 1 },
  grid: { flex: 1 },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm },
  posterCell: {
    flex: 1,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  posterImage: { width: '100%', height: '100%' },
  loader: { paddingVertical: spacing.xl },
  empty: { paddingVertical: spacing.xl },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
  },
  resetText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pressed: { opacity: 0.85 },
});
