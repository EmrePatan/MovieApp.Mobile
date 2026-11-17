import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { useSocialPendingFollowRequests } from '@/features/social/hooks/useSocialQueries';
import { useSocialFollowRequestMutations } from '@/features/social/hooks/useSocialMutations';
import type { SocialFollowRequest } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SocialRequestsScreen() {
  const router = useRouter();
  const requests = useSocialPendingFollowRequests();
  const requestItems = requests.data?.pages.flatMap(page => page) ?? [];
  const mutations = useSocialFollowRequestMutations();

  const renderItem = useCallback(({ item }: { item: SocialFollowRequest }) => (
    <View style={styles.row}>
      <View style={styles.avatar}><AppText variant="body">{item.displayName.slice(0, 1).toUpperCase()}</AppText></View>
      <View style={styles.copy}>
        <AppText variant="body">{item.displayName}</AppText>
        <AppText variant="caption" muted>@{item.userName}</AppText>
      </View>
      <Pressable disabled={mutations.accept.isPending} onPress={() => mutations.accept.mutate(item.userId)} style={styles.accept}>
        <AppText variant="caption" style={styles.buttonText}>Kabul</AppText>
      </Pressable>
      <Pressable disabled={mutations.reject.isPending} onPress={() => mutations.reject.mutate(item.userId)} style={styles.reject}>
        <AppText variant="caption">Reddet</AppText>
      </Pressable>
    </View>
  ), [mutations]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><AppText variant="body">‹ Geri</AppText></Pressable>
        <AppText variant="title">Takip istekleri</AppText>
      </View>
      {requests.isLoading ? <View style={styles.center}><ActivityIndicator color={colors.accent} /></View> :
        requests.isError && requestItems.length === 0 ? <View style={styles.center}><AppText variant="bodySmall" muted>İstekler yüklenemedi.</AppText><Pressable onPress={() => void requests.refetch()}><AppText variant="caption" style={styles.retry}>Tekrar dene</AppText></Pressable></View> :
          <FlatList data={requestItems} keyExtractor={item => item.userId} renderItem={renderItem}
            contentContainerStyle={styles.list}
            onEndReached={() => {
              if (requests.hasNextPage && !requests.isFetchingNextPage) void requests.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={requests.isError && requestItems.length > 0 ? <View style={styles.inlineError}><AppText variant="caption" muted>İstekler yenilenemedi.</AppText><Pressable onPress={() => void requests.refetch()}><AppText variant="caption" style={styles.retry}>Tekrar dene</AppText></Pressable></View> : null}
            ListFooterComponent={requests.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.footer} /> : requests.isFetchNextPageError ? <View style={styles.center}><AppText variant="caption" muted>Sonraki sayfa yüklenemedi.</AppText><Pressable onPress={() => void requests.fetchNextPage()}><AppText variant="caption" style={styles.retry}>Tekrar dene</AppText></Pressable></View> : null}
            ListEmptyComponent={<AppText variant="bodySmall" muted center>Bekleyen takip isteğin yok.</AppText>} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.md },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  accept: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.accent, borderRadius: 10 },
  buttonText: { color: colors.textPrimary },
  reject: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inlineError: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  footer: { paddingVertical: spacing.lg },
  retry: { color: colors.accent, marginTop: spacing.sm },
});
