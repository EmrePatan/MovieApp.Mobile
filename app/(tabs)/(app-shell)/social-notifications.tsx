import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useSocialNotifications } from '@/features/social/hooks/useSocialQueries';
import { useMarkAllSocialNotificationsRead, useMarkSocialNotificationRead } from '@/features/social/hooks/useSocialMutations';
import type { SocialNotificationItem } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';


export default function SocialNotificationsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const notificationText = (type: string): string => {
    switch (type) {
      case 'FollowRequest': return t('social.notificationFollowRequest');
      case 'NewFollower': return t('social.notificationNewFollower');
      case 'FollowAccepted': return t('social.notificationFollowAccepted');
      case 'ActivityLike': return t('social.notificationActivityLike');
      case 'NewComment': return t('social.notificationNewComment');
      case 'CommentReply': return t('social.notificationCommentReply');
      case 'CommentLike': return t('social.notificationCommentLike');
      default: return t('social.notificationGeneric');
    }
  };
  const query = useSocialNotifications();
  const markRead = useMarkSocialNotificationRead();
  const markAllRead = useMarkAllSocialNotificationsRead();
  const notifications = useMemo(
    () => query.data?.pages.flatMap(page => page.items) ?? [],
    [query.data?.pages],
  );
  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;

  const handlePress = useCallback((item: SocialNotificationItem) => {
    if (!item.isRead) markRead.mutate(item.id);
    if (item.activityId) router.push(`/(tabs)/(app-shell)/social/${item.activityId}`);
    else if (item.notificationType === 'FollowRequest') router.push('/(tabs)/(app-shell)/social-requests');
    else if (item.actorId) router.push(`/(tabs)/(app-shell)/social-profile/${item.actorId}`);
  }, [markRead, router]);

  const renderItem = useCallback(({ item }: { item: SocialNotificationItem }) => (
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.displayName} ${notificationText(item.notificationType)}`} onPress={() => handlePress(item)} style={[styles.row, !item.isRead && styles.unread]}>
      <View style={styles.avatar}><AppText variant="body">{item.displayName.slice(0, 1).toUpperCase()}</AppText></View>
      <View style={styles.copy}>
        <AppText variant="body">{item.displayName} {notificationText(item.notificationType)}</AppText>
        <AppText variant="caption" muted>{new Date(item.createdAt).toLocaleString(i18n.language)}</AppText>
      </View>
      {!item.isRead ? <View style={styles.dot} /> : null}
    </Pressable>
  ), [handlePress, i18n.language, t]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('social.back')} onPress={() => router.back()}><AppText variant="body">‹ {t('social.back')}</AppText></Pressable>
        <AppText variant="title">{t('social.notificationsTitle')}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel={t('social.markAllRead')} disabled={!unreadCount || markAllRead.isPending} onPress={() => markAllRead.mutate()}>
          <AppText variant="caption" style={styles.markAll}>{t('social.markAllRead')}</AppText>
        </Pressable>
      </View>
      {query.isLoading ? <View style={styles.center}><ActivityIndicator color={colors.accent} /></View> :
        query.isError && notifications.length === 0 ? (
          <View style={styles.center}>
            <AppText variant="bodySmall" muted>{t('social.notificationsLoadError')}</AppText>
            <AppButton title={t('common.retry')} variant="secondary" onPress={() => void query.refetch()} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => void query.refetch()}
            ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.footer} /> : query.isFetchNextPageError ? <View style={styles.center}><AppText variant="caption" muted>{t('social.nextPageError')}</AppText><AppButton title={t('common.retry')} variant="secondary" onPress={() => void query.fetchNextPage()} /></View> : null}
            ListEmptyComponent={<AppText variant="bodySmall" muted center>{t('social.noNotifications')}</AppText>}
          />
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.md },
  markAll: { color: colors.accent },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface },
  unread: { borderWidth: 1, borderColor: colors.borderAccent },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  footer: { paddingVertical: spacing.lg },
});
