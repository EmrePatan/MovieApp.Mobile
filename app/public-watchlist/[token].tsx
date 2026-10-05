import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { LibraryContentCard } from '@/features/library/components/LibraryContentCard';
import { LibraryEmptyState } from '@/features/library/components/LibraryEmptyState';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import { usePublicWatchlistShare } from '@/features/watchlist-share/hooks/usePublicWatchlistShare';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function PublicWatchlistScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const decodedToken = decodeURIComponent(token ?? '');
  const query = usePublicWatchlistShare(decodedToken);

  const items = useMemo<LibraryItem[]>(() => {
    if (!query.data?.items) {
      return [];
    }

    return query.data.items.map((item) => ({
      id: item.contentId,
      type: item.contentType,
      title: item.title,
      posterPath: item.posterPath,
      airDate: item.year ? `${item.year}-01-01` : null,
      voteAverage: item.voteAverage,
      createdAt: new Date(0).toISOString(),
    }));
  }, [query.data?.items]);

  const heading = useMemo(() => {
    const listName = query.data?.watchlistName?.trim();
    if (listName) {
      return listName;
    }

    const ownerName = query.data?.ownerDisplayName?.trim();
    if (ownerName) {
      return t('watchlistShare.publicTitleNamed', { name: ownerName });
    }

    return t('watchlistShare.publicTitleGeneric');
  }, [query.data?.ownerDisplayName, query.data?.watchlistName, t]);

  const handleItemPress = useCallback(
    (item: LibraryItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  if (query.isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <LibraryLoadingState accessibilityLabel={t('common.loading')} />
      </SafeAreaView>
    );
  }

  if (query.isError) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <AppText variant="title">{t('watchlistShare.publicRevokedTitle')}</AppText>
        </View>
        <LibraryEmptyState
          icon="bookmark"
          title={t('watchlistShare.publicRevokedTitle')}
          message={t('watchlistShare.publicRevokedMessage')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <AppText variant="title">{heading}</AppText>
        <AppText variant="caption" muted>
          {t('watchlistShare.publicItemCount', { count: items.length })}
        </AppText>
      </View>
      {items.length === 0 ? (
        <LibraryEmptyState
          icon="bookmark"
          title={t('watchlistShare.publicEmptyTitle')}
          message={t('watchlistShare.publicEmptyMessage')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.type}:${item.id}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <LibraryContentCard item={item} onPress={handleItemPress} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  list: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
});
