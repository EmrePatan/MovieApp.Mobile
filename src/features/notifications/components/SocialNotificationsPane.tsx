import { useCallback, useMemo, useRef, type ComponentProps, type RefObject } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import { SocialUserListRow } from '@/features/social/components/SocialUserListRow';
import { useSocialNotifications } from '@/features/social/hooks/useSocialQueries';
import { useMarkSocialNotificationRead } from '@/features/social/hooks/useSocialMutations';
import { useCreateDirectConversation } from '@/features/messages/hooks/useMessageMutations';
import type { SocialNotificationItem } from '@/features/social/types';
import { openSocialProfile } from '@/features/social/navigation/open-social-profile';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { socialNotificationText } from '../utils/social-notification-copy';
import { formatNotificationRelativeTime } from '../utils/format-notification-relative-time';
import { layout } from '@/theme/layout';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

interface SocialNotificationsPaneProps {
  listRef?: RefObject<FlatList | null>;
  onScroll?: ComponentProps<typeof FlatList>['onScroll'];
  scrollEventThrottle?: number;
}

export function SocialNotificationsPane({
  listRef,
  onScroll,
  scrollEventThrottle,
}: SocialNotificationsPaneProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const query = useSocialNotifications();
  const markRead = useMarkSocialNotificationRead();
  const openDirectMessage = useCreateDirectConversation();
  const internalRef = useRef<FlatList>(null);
  const resolvedRef = listRef ?? internalRef;
  const notifications = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );

  const handlePress = useCallback(
    (item: SocialNotificationItem) => {
      if (!item.isRead) {
        markRead.mutate(item.id);
      }
      if (item.notificationType === 'DirectMessage' && item.actorId) {
        openDirectMessage.mutate(item.actorId);
        return;
      }
      if (item.activityId) {
        const parentId = item.parentCommentId?.trim();
        const path = parentId
          ? `/(tabs)/(app-shell)/social/${item.activityId}?parentCommentId=${parentId}`
          : `/(tabs)/(app-shell)/social/${item.activityId}`;
        router.push(path);
        return;
      }
      if (item.notificationType === 'FollowRequest') {
        router.push('/(tabs)/(app-shell)/social-requests');
        return;
      }
      if (item.actorId) {
        openSocialProfile(router, item.actorId);
      }
    },
    [markRead, openDirectMessage, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: SocialNotificationItem }) => {
      const relativeTime = formatNotificationRelativeTime(item.createdAt);
      const meta = relativeTime
        ? `${socialNotificationText(item.notificationType, t)} · ${relativeTime}`
        : socialNotificationText(item.notificationType, t);

      return (
        <View style={styles.rowWrap}>
          <View style={!item.isRead ? styles.unreadWrap : undefined}>
            <SocialUserListRow
              displayName={item.displayName}
              userName={item.userName}
              avatarUrl={item.avatarUrl}
              meta={meta}
              onPress={() => handlePress(item)}
              trailing={!item.isRead ? <View style={styles.dot} /> : undefined}
            />
          </View>
        </View>
      );
    },
    [handlePress, t],
  );

  if (query.isLoading && notifications.length === 0) {
    return (
      <View style={styles.fill}>
        <LibraryLoadingState accessibilityLabel={t('common.loadingNotifications')} />
      </View>
    );
  }

  if (query.isError && notifications.length === 0) {
    return (
      <View style={styles.fill}>
        <View style={styles.errorContainer}>
          <ErrorView
            message={t('social.notificationsLoadError')}
            onRetry={() => void query.refetch()}
            retryLabel={t('common.retry')}
          />
        </View>
      </View>
    );
  }

  return (
    <PlatformRefreshFlatList
      ref={resolvedRef}
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      onRefresh={() => void query.refetch()}
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      onEndReached={() => {
        if (!shouldRequestNextInfinitePage(query)) {
          return;
        }
        void query.fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      ListEmptyComponent={
        <View style={styles.empty}>
          <AppText variant="subtitle" center>
            {t('social.noNotifications')}
          </AppText>
        </View>
      }
      ListFooterComponent={
        query.isFetchingNextPage ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={premiumSheet.mutedGold} />
          </View>
        ) : null
      }
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
  rowWrap: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xs,
  },
  unreadWrap: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: premiumSheet.goldBorder,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: premiumSheet.mutedGold,
  },
  empty: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xl,
    alignItems: 'center',
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
});
