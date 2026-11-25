import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { useSearchResults } from '@/features/search/hooks/useSearch';
import {
  isPersonSearchResult,
  MIN_SEARCH_QUERY_LENGTH,
  type CatalogSearchResultItem,
} from '@/features/search/types';
import { socialFeedTheme } from '@/features/social/components/social-feed-theme';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';
import type { ChatTitleShare } from '../utils/chat-title-share';

interface ChatTitlePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (share: ChatTitleShare) => void;
}

const DEBOUNCE_MS = 300;

/** Search a movie or show and drop it into the chat as a title card. */
export function ChatTitlePickerSheet({ visible, onClose, onSelect }: ChatTitlePickerSheetProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const search = useSearchResults(visible ? debounced : '', 'all');
  const results = useMemo(
    () =>
      (search.data?.pages.flatMap((page) => page.items) ?? []).filter(
        (item): item is CatalogSearchResultItem => !isPersonSearchResult(item),
      ),
    [search.data?.pages],
  );

  const close = () => {
    setQuery('');
    setDebounced('');
    onClose();
  };

  const showResults = debounced.length >= MIN_SEARCH_QUERY_LENGTH;

  return (
    <AppBottomSheet
      visible={visible}
      onClose={close}
      title={t('extras.shareTitleSheet')}
      avoidKeyboard
      testID="chat-title-picker-sheet"
    >
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.body}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={socialFeedTheme.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('social.composerSearchPlaceholder')}
              placeholderTextColor={socialFeedTheme.placeholder}
              style={styles.searchInput}
              autoFocus
              autoCorrect={false}
              accessibilityLabel={t('social.composerSearchPlaceholder')}
            />
          </View>

          {showResults ? (
            search.isLoading ? (
              <ActivityIndicator color={socialFeedTheme.accent} style={styles.loader} />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                keyboardShouldPersistTaps="handled"
                style={styles.results}
                ListEmptyComponent={
                  <AppText style={styles.hint}>{t('social.noSearchResults')}</AppText>
                }
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                    onPress={() => {
                      onSelect({
                        contentType: item.type === 'tv' ? 'tv' : 'movie',
                        id: item.id,
                        title: item.title,
                        posterPath: item.posterUrl ?? null,
                        year: item.year ? String(item.year) : null,
                      });
                      close();
                    }}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  >
                    <View style={styles.poster}>
                      <CatalogImage
                        path={item.posterUrl}
                        width={40}
                        height={60}
                        accessibilityLabel={item.title}
                        rounded={false}
                      />
                    </View>
                    <View style={styles.copy}>
                      <AppText style={styles.title} numberOfLines={2}>
                        {item.title}
                      </AppText>
                      <AppText style={styles.meta}>
                        {[item.type === 'tv' ? t('common.tv') : t('social.movies'), item.year]
                          .filter(Boolean)
                          .join(' · ')}
                      </AppText>
                    </View>
                  </Pressable>
                )}
              />
            )
          ) : (
            <AppText style={styles.hint}>{t('social.composerHint')}</AppText>
          )}
        </View>
      </GestureHandlerRootView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 24,
    backgroundColor: glass.panelInput,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: socialFeedTheme.textPrimary,
  },
  results: { maxHeight: 280 },
  loader: { paddingVertical: spacing.xl },
  hint: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
    color: socialFeedTheme.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.85 },
  poster: {
    width: 40,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: socialFeedTheme.surfaceSecondary,
  },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: socialFeedTheme.textPrimary,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textMuted,
  },
});
