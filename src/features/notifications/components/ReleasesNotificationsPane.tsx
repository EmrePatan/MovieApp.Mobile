import { useCallback, useMemo, useRef, type ComponentProps, type RefObject } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { NotificationRow } from './NotificationRow';
import { NotificationsEmptyState } from './NotificationsEmptyState';
import { useDeleteNotification } from '../hooks/useDeleteNotification';
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead';
import { useNotificationsInbox } from '../hooks/useNotificationsInbox';
import type { NotificationItem } from '../types';
import { flattenNotificationPages } from '../utils/flatten-notification-pages';
import { buildNotificationRoute } from '../utils/notification-navigation';
import { layout } from '@/theme/layout';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

interface ReleasesNotificationsPaneProps {
  listRef?: RefObject<FlatList | null>;
  onScroll?: ComponentProps<typeof FlatList>['onScroll'];
  scrollEventThrottle?: number;
}

export function ReleasesNotificationsPane({
  listRef,
  onScroll,
  scrollEventThrottle,
}: ReleasesNotificationsPaneProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const notificationsQuery = useNotificationsInbox();
  const markNotificationRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();
  const internalRef = useRef<FlatList>(null);
  const resolvedRef = listRef ?? internalRef;

  const items = useMemo(
    () => flattenNotificationPages(notificationsQuery.data?.pages ?? []),
    [notificationsQuery.data?.pages],
  );

  const handleItemPress = useCallback(
    (item: NotificationItem) => {
      if (item.readAtUtc == null) {
        markNotificationRead.mutate(item.id);
      }
      router.push(buildNotificationRoute(item.contentType, item.contentId));
    },
    [markNotificationRead, router],
  );

  const handleDelete = useCallback(
    (item: NotificationItem) => {
      if (deleteNotification.isPending) {
        return;
      }
      deleteNotification.mutate({
        notificationId: item.id,
        wasUnread: item.readAtUtc == null,
      });
    },
    [deleteNotification],
  );

  const handleLoadMore = useCallback(() => {
    if (!shouldRequestNextInfinitePage(notificationsQuery)) {
      return;
    }
    void notificationsQuery.fetchNextPage();
  }, [notificationsQuery]);

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationRow item={item} onPress={handleItemPress} onDelete={handleDelete} />
    ),
    [handleDelete, handleItemPress],
  );

  if (notificationsQuery.isLoading && items.length === 0) {
    return (
      <View style={styles.fill}>
        <LibraryLoadingState accessibilityLabel={t('common.loadingNotifications')} />
      </View>
    );
  }

  if (notificationsQuery.isError && items.length === 0) {
    return (
      <View style={styles.fill}>
        <View style={styles.errorContainer}>
          <ErrorView
            message={t('notifications.loadError')}
            onRetry={() => void notificationsQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        </View>
      </View>
    );
  }

  return (
    <PlatformRefreshFlatList
      ref={resolvedRef}
      refreshing={notificationsQuery.isRefetching && !notificationsQuery.isFetchingNextPage}
      onRefresh={() => void notificationsQuery.refetch()}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={<NotificationsEmptyState />}
      ListFooterComponent={
        notificationsQuery.isFetchingNextPage ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={premiumSheet.mutedGold} />
          </View>
        ) : notificationsQuery.isFetchNextPageError ? (
          <View style={styles.footerError}>
            <AppText variant="bodySmall" muted center>
              {t('common.unableToLoadMoreNotifications')}
            </AppText>
            <AppButton
              title={t('common.retry')}
              variant="secondary"
              onPress={() => void notificationsQuery.fetchNextPage()}
            />
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      initialNumToRender={layout.verticalList.initialNumToRender}
      maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
      windowSize={layout.verticalList.windowSize}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerError: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
