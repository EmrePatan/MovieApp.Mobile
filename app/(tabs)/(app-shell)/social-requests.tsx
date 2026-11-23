import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { SocialUserListRow } from '@/features/social/components/SocialUserListRow';
import { useSocialPendingFollowRequests } from '@/features/social/hooks/useSocialQueries';
import { useSocialFollowRequestMutations } from '@/features/social/hooks/useSocialMutations';
import type { SocialFollowRequest } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { IconEmptyState } from '@/components/common/IconEmptyState';

export default function SocialRequestsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const requests = useSocialPendingFollowRequests();
  const requestItems = requests.data?.pages.flatMap((page) => page) ?? [];
  const mutations = useSocialFollowRequestMutations();

  const renderItem = useCallback(
    ({ item }: { item: SocialFollowRequest }) => (
      <SocialUserListRow
        displayName={item.displayName}
        userName={item.userName}
        trailing={
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('social.accept')} ${item.displayName}`}
              disabled={mutations.accept.isPending}
              onPress={() => mutations.accept.mutate(item.userId)}
              style={({ pressed }) => [styles.accept, pressed && styles.pressed]}
            >
              <AppText style={styles.acceptLabel}>{t('social.accept')}</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('social.reject')} ${item.displayName}`}
              disabled={mutations.reject.isPending}
              onPress={() => mutations.reject.mutate(item.userId)}
              style={({ pressed }) => [styles.reject, pressed && styles.pressed]}
            >
              <AppText style={styles.rejectLabel}>{t('social.reject')}</AppText>
            </Pressable>
          </View>
        }
      />
    ),
    [mutations.accept, mutations.reject, t],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <SocialSubscreenHeader title={t('social.followRequests')} onBack={() => router.back()} />
      {requests.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : requests.isError && requestItems.length === 0 ? (
        <View style={styles.center}>
          <AppText style={styles.empty}>{t('social.requestsLoadError')}</AppText>
          <Pressable onPress={() => void requests.refetch()}>
            <AppText style={styles.retry}>{t('common.retry')}</AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={requestItems}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (requests.hasNextPage && !requests.isFetchingNextPage) void requests.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <IconEmptyState icon="person-add-outline" title={t('social.noPendingRequests')} />
          }
          ListFooterComponent={
            requests.isFetchingNextPage ? (
              <ActivityIndicator color={colors.accent} style={styles.footer} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  accept: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentStrong,
  },
  acceptLabel: { fontSize: 12, fontWeight: '700', color: colors.background },
  reject: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: 13, paddingVertical: spacing.xl },
  footer: { paddingVertical: spacing.lg },
  retry: { color: colors.accent, fontWeight: '600' },
  pressed: { opacity: 0.88 },
});
