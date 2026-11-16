import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAuth } from '@/auth/useAuth';
import { useSocialFeed } from '@/features/social/hooks/useSocialQueries';
import { useToggleSocialActivityLike } from '@/features/social/hooks/useSocialMutations';
import type { SocialFeedItem } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

function getActivityLabel(type: string): string {
  switch (type) {
    case 'WatchedMovie': return 'izledi';
    case 'WatchedEpisode': return 'bölümünü izledi';
    case 'RatedMovie':
    case 'RatedTvShow': return 'puan verdi';
    case 'ReviewedMovie':
    case 'ReviewedTvShow': return 'yorum yaptı';
    case 'FavoritedMovie':
    case 'FavoritedTvShow': return 'favorilerine ekledi';
    default: return 'etkinlik yaptı';
  }
}

function SocialActivityCard({
  item,
  onLike,
  onComments,
  isLiking,
}: {
  item: SocialFeedItem;
  onLike: (item: SocialFeedItem) => void;
  onComments: (item: SocialFeedItem) => void;
  isLiking: boolean;
}) {
  const dateLabel = new Date(item.createdAt).toLocaleDateString();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <AppText variant="subtitle">{item.displayName.slice(0, 1).toUpperCase()}</AppText>
        </View>
        <View style={styles.actorBlock}>
          <AppText variant="body" style={styles.actorName}>{item.displayName}</AppText>
          <AppText variant="caption" muted>@{item.userName} · {dateLabel}</AppText>
        </View>
      </View>
      <AppText variant="body">
        {item.displayName} {getActivityLabel(item.activityType)}
      </AppText>
      <View style={styles.contentCard}>
        <AppText variant="subtitle">{item.targetTitle || 'İçerik'}</AppText>
        {item.targetSubtitle ? <AppText variant="bodySmall" muted>{item.targetSubtitle}</AppText> : null}
        {item.ratingScore !== null ? <AppText variant="bodySmall">★ {item.ratingScore}/10</AppText> : null}
        {item.reviewExcerpt ? <AppText variant="bodySmall" muted numberOfLines={4}>{item.reviewExcerpt}</AppText> : null}
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.isLikedByMe ? 'Beğeniyi kaldır' : 'Beğen'}
          disabled={isLiking}
          onPress={() => onLike(item)}
          style={styles.actionButton}
        >
          <AppText variant="bodySmall" style={item.isLikedByMe ? styles.liked : undefined}>
            {item.isLikedByMe ? '♥' : '♡'} {item.likesCount}
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onComments(item)} style={styles.actionButton}>
          <AppText variant="bodySmall">Yorumlar · {item.commentsCount}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default function SocialFeedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const feed = useSocialFeed();
  const toggleLike = useToggleSocialActivityLike();
  const items = useMemo(() => feed.data?.pages.flatMap(page => page.items) ?? [], [feed.data?.pages]);

  const handleLike = useCallback((item: SocialFeedItem) => {
    toggleLike.mutate({ activityId: item.id, isLiked: item.isLikedByMe });
  }, [toggleLike]);

  const handleComments = useCallback((item: SocialFeedItem) => {
    router.push(`/(tabs)/(app-shell)/social/${item.id}`);
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
  }, [feed]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.empty}>
          <AppText variant="title">{t('social.title', 'Sosyal')}</AppText>
          <AppText variant="bodySmall" muted>{t('social.signIn', 'Akışı görmek için giriş yap.')}</AppText>
          <AppButton title={t('auth.signIn')} onPress={() => router.push('/(auth)/login')} />
        </View>
      </SafeAreaView>
    );
  }

  if (feed.isLoading && items.length === 0) {
    return <SafeAreaView style={styles.screen}><View style={styles.empty}><ActivityIndicator color={colors.accent} /></View></SafeAreaView>;
  }

  if (feed.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.empty}>
          <AppText variant="bodySmall" muted>{t('social.loadError', 'Sosyal akış yüklenemedi.')}</AppText>
          <AppButton title={t('common.retry')} variant="secondary" onPress={() => void feed.refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SocialActivityCard
            item={item}
            onLike={handleLike}
            onComments={handleComments}
            isLiking={toggleLike.isPending && toggleLike.variables?.activityId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshing={feed.isRefetching && !feed.isFetchingNextPage}
        onRefresh={() => void feed.refetch()}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <AppText variant="title" style={styles.title}>{t('social.title', 'Sosyal')}</AppText>
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/(tabs)/(app-shell)/social-requests')}>
                <AppText variant="caption" style={styles.headerAction}>İstekler</AppText>
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/(app-shell)/social-notifications')}>
                <AppText variant="caption" style={styles.headerAction}>Bildirimler</AppText>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={<View style={styles.empty}><AppText variant="bodySmall" muted>{t('social.empty', 'Henüz paylaşım yok. İlk hareketi sen oluştur!')}</AppText></View>}
        ListFooterComponent={feed.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.footer} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  headerAction: { color: colors.accent },
  title: { marginTop: spacing.md, marginBottom: spacing.sm },
  card: { padding: spacing.md, borderRadius: 16, backgroundColor: colors.surface, gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  actorBlock: { flex: 1 },
  actorName: { fontWeight: '600' },
  contentCard: { padding: spacing.md, borderRadius: 12, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  actionButton: { paddingVertical: spacing.xs },
  liked: { color: colors.accent },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  footer: { padding: spacing.lg },
});
