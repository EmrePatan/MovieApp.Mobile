import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { NotificationRow } from '@/features/notifications/components/NotificationRow';
import { NotificationsEmptyState } from '@/features/notifications/components/NotificationsEmptyState';
import { useDeleteNotification } from '@/features/notifications/hooks/useDeleteNotification';
import { useMarkAllNotificationsRead } from '@/features/notifications/hooks/useMarkAllNotificationsRead';
import { useMarkNotificationRead } from '@/features/notifications/hooks/useMarkNotificationRead';
import { useNotificationsInbox } from '@/features/notifications/hooks/useNotificationsInbox';
import type { NotificationItem } from '@/features/notifications/types';
import { flattenNotificationPages } from '@/features/notifications/utils/flatten-notification-pages';
import { buildNotificationRoute } from '@/features/notifications/utils/notification-navigation';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const notificationsQuery = useNotificationsInbox();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const items = useMemo(
    () => flattenNotificationPages(notificationsQuery.data?.pages ?? []),
    [notificationsQuery.data?.pages],
  );

  const hasUnread = useMemo(
    () => items.some((item) => item.readAtUtc == null),
    [items],
  );

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleItemPress = useCallback(
    (item: NotificationItem) => {
      if (item.readAtUtc == null) {
        markNotificationRead.mutate(item.id);
      }

      router.push(buildNotificationRoute(item.contentType, item.contentId));
    },
    [markNotificationRead, router],
  );

  const handleMarkAllRead = useCallback(() => {
    if (markAllNotificationsRead.isPending || !hasUnread) {
      return;
    }

    markAllNotificationsRead.mutate();
  }, [hasUnread, markAllNotificationsRead]);

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
    if (
      !notificationsQuery.hasNextPage ||
      notificationsQuery.isFetchingNextPage ||
      notificationsQuery.isFetching
    ) {
      return;
    }

    void notificationsQuery.fetchNextPage();
  }, [notificationsQuery]);

  const handleRefresh = useCallback(() => {
    void notificationsQuery.refetch();
  }, [notificationsQuery]);

  const handleRetryNextPage = useCallback(() => {
    void notificationsQuery.fetchNextPage();
  }, [notificationsQuery]);

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationRow
        item={item}
        onPress={handleItemPress}
        onDelete={handleDelete}
      />
    ),
    [handleDelete, handleItemPress],
  );

  const listHeader = (
    <View style={styles.header}>
      <DetailBackButton />
      <View style={styles.titleRow}>
        <AppText variant="title">{t('notifications.title')}</AppText>
        {isAuthenticated ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('notifications.markAllRead')}
            accessibilityState={{ disabled: !hasUnread || markAllNotificationsRead.isPending }}
            disabled={!hasUnread || markAllNotificationsRead.isPending}
            onPress={handleMarkAllRead}
            style={({ pressed }) => [styles.markAllButton, pressed && styles.pressed]}
          >
            <AppText
              variant="bodySmall"
              style={!hasUnread ? styles.markAllDisabled : styles.markAllEnabled}
            >
              {t('notifications.markAllRead')}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <AppText variant="bodySmall" muted>
        {t('notifications.subtitle')}
      </AppText>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.filteredEmpty}>
          <AppText variant="subtitle" center>
            {t('notifications.guestTitle')}
          </AppText>
          <AppText variant="bodySmall" muted center>
            {t('notifications.guestMessage')}
          </AppText>
          <AppButton title={t('common.signInTitleCase')} variant="secondary" onPress={handleSignIn} />
        </View>
      </SafeAreaView>
    );
  }

  if (notificationsQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel={t('common.loadingNotifications')} />
      </SafeAreaView>
    );
  }

  if (notificationsQuery.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message={t('notifications.loadError')}
            onRetry={() => void notificationsQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const paginationErrorMessage = notificationsQuery.isFetchNextPageError
    ? t('common.unableToLoadMoreNotifications')
    : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<NotificationsEmptyState />}
        ListFooterComponent={
          notificationsQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : notificationsQuery.isFetchNextPageError ? (
            <View style={styles.footerError}>
              <AppText variant="bodySmall" muted center>
                {paginationErrorMessage}
              </AppText>
              <AppButton title={t('common.retry')} variant="secondary" onPress={handleRetryNextPage} />
            </View>
          ) : null
        }
        refreshControl={
          <MovieAppRefreshControl
            refreshing={
              notificationsQuery.isRefetching && !notificationsQuery.isFetchingNextPage
            }
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  markAllButton: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  markAllEnabled: {
    color: colors.accent,
  },
  markAllDisabled: {
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.85,
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
  filteredEmpty: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
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
