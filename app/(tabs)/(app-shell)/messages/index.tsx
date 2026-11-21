import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { useAuth } from '@/auth/useAuth';
import { ConversationRow } from '@/features/messages/components/ConversationRow';
import { useDirectConversations } from '@/features/messages/hooks/useMessageQueries';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function MessagesInboxScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const query = useDirectConversations();
  const conversations = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <SocialSubscreenHeader
        title={t('messages.inbox')}
        onBack={() => router.back()}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('messages.newMessage')}
            onPress={() => router.push('/(tabs)/(app-shell)/messages/new')}
            hitSlop={8}
            style={({ pressed }) => [styles.compose, pressed && styles.pressed]}
          >
            <Ionicons name="create-outline" size={18} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <PlatformRefreshFlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => void query.refetch()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ConversationRow
            item={item}
            currentUserId={user?.id}
            onPress={() => router.push(`/(tabs)/(app-shell)/messages/${item.id}`)}
          />
        )}
        onEndReached={() => {
          if (shouldRequestNextInfinitePage(query)) {
            void query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          query.isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loading} />
          ) : query.isError ? (
            <View style={styles.empty}>
              <AppText style={styles.emptyTitle}>{t('messages.loadError')}</AppText>
              <Pressable onPress={() => void query.refetch()}>
                <AppText style={styles.retry}>{t('common.retry')}</AppText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.empty}>
              <AppText style={styles.emptyTitle}>{t('messages.emptyTitle')}</AppText>
              <AppText style={styles.emptyBody}>{t('messages.emptyBody')}</AppText>
            </View>
          )
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator color={colors.accent} style={styles.loading} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  compose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  pressed: { opacity: 0.88 },
  list: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  loading: { padding: spacing.lg },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  retry: { color: colors.accent, fontWeight: '600' },
});
