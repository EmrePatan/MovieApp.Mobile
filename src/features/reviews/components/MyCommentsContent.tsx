import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { openCatalogDetailFromDetail } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { LibraryMediaFilterControl } from '@/features/library/components/LibraryMediaFilterControl';
import type { CatalogMediaFilter } from '@/features/library/types';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { useMyComments } from '../hooks/useMyComments';
import type { UserReviewListItem } from '../types/my-comments';
import { MyCommentRow } from './MyCommentRow';
import { MyCommentsEmptyState } from './MyCommentsEmptyState';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export function MyCommentsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mediaType, setMediaType] = useState<CatalogMediaFilter>('all');
  const commentsQuery = useMyComments(mediaType);

  const items = useMemo(
    () => commentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [commentsQuery.data?.pages],
  );

  const handleOpenDetail = useCallback(
    (item: UserReviewListItem) => {
      openCatalogDetailFromDetail(router, item.contentId, item.contentType);
    },
    [router],
  );

  const handleDiscover = useCallback(() => {
    router.push('/(tabs)/(app-shell)/discover');
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (shouldRequestNextInfinitePage(commentsQuery)) {
      void commentsQuery.fetchNextPage();
    }
  }, [commentsQuery]);

  if (commentsQuery.isLoading && items.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
        <AppText variant="bodySmall" muted>
          {t('common.loading')}
        </AppText>
      </View>
    );
  }

  if (commentsQuery.isError && items.length === 0) {
    const message = isApiError(commentsQuery.error)
      ? commentsQuery.error.userMessage
      : t('common.somethingWentWrong');

    return (
      <View style={styles.error}>
        <ErrorView message={message} onRetry={() => void commentsQuery.refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MyCommentRow item={item} onPress={handleOpenDetail} />}
      contentContainerStyle={[
        styles.listContent,
        items.length === 0 && styles.listContentEmpty,
      ]}
      ListHeaderComponent={
        <View style={styles.filters}>
          <LibraryMediaFilterControl value={mediaType} onChange={setMediaType} />
        </View>
      }
      ListEmptyComponent={<MyCommentsEmptyState onDiscover={handleDiscover} />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        commentsQuery.isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={colors.accent} size="small" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  error: {
    flex: 1,
    padding: spacing.lg,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
