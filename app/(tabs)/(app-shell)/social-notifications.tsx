import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { useSocialNotifications } from '@/features/social/hooks/useSocialQueries';
import { useMarkAllSocialNotificationsRead, useMarkSocialNotificationRead } from '@/features/social/hooks/useSocialMutations';
import type { SocialNotificationItem } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

function notificationText(type: string): string {
  switch (type) {
    case 'FollowRequest': return 'seni takip etmek istiyor.';
    case 'NewFollower': return 'seni takip etmeye başladı.';
    case 'FollowAccepted': return 'takip isteğini kabul etti.';
    case 'ActivityLike': return 'hareketini beğendi.';
    case 'NewComment': return 'hareketine yorum yaptı.';
    case 'CommentReply': return 'yorumuna yanıt verdi.';
    case 'CommentLike': return 'yorumunu beğendi.';
    default: return 'yeni bir etkileşimde bulundu.';
  }
}

export default function SocialNotificationsScreen() {
  const router = useRouter();
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
    <Pressable onPress={() => handlePress(item)} style={[styles.row, !item.isRead && styles.unread]}>
      <View style={styles.avatar}><AppText variant="body">{item.displayName.slice(0, 1).toUpperCase()}</AppText></View>
      <View style={styles.copy}>
        <AppText variant="body">{item.displayName} {notificationText(item.notificationType)}</AppText>
        <AppText variant="caption" muted>{new Date(item.createdAt).toLocaleString()}</AppText>
      </View>
      {!item.isRead ? <View style={styles.dot} /> : null}
    </Pressable>
  ), [handlePress]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><AppText variant="body">‹ Geri</AppText></Pressable>
        <AppText variant="title">Sosyal bildirimler</AppText>
        <Pressable disabled={!unreadCount || markAllRead.isPending} onPress={() => markAllRead.mutate()}>
          <AppText variant="caption" style={styles.markAll}>Tümünü okundu işaretle</AppText>
        </Pressable>
      </View>
      {query.isLoading ? <View style={styles.center}><ActivityIndicator color={colors.accent} /></View> :
        query.isError ? <View style={styles.center}><AppText variant="bodySmall" muted>Bildirimler yüklenemedi.</AppText></View> :
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={query.isFetchingNextPage
              ? <ActivityIndicator color={colors.accent} style={styles.footer} />
              : null}
            ListEmptyComponent={<AppText variant="bodySmall" muted center>Henüz sosyal bildirimin yok.</AppText>}
          />}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingVertical: spacing.lg },
});
