import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { normalizeRouteParam } from '@/features/navigation/normalize-route-param';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { SocialUserListRow } from '@/features/social/components/SocialUserListRow';
import { useSocialFollowers, useSocialFollowing } from '@/features/social/hooks/useSocialQueries';
import { openSocialProfile } from '@/features/social/navigation/open-social-profile';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function SocialPeopleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ userId: string | string[]; type?: string | string[] }>();
  const userId = useMemo(() => normalizeRouteParam(params.userId), [params.userId]);
  const type = useMemo(() => normalizeRouteParam(params.type), [params.type]);
  const isFollowers = type !== 'following';
  const followers = useSocialFollowers(userId, isFollowers);
  const following = useSocialFollowing(userId, !isFollowers);
  const query = isFollowers ? followers : following;
  const items = query.data?.pages.flatMap((page) => page) ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <SocialSubscreenHeader
        title={isFollowers ? t('social.followers') : t('social.following')}
        onBack={() => router.back()}
      />
      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : query.isError && items.length === 0 ? (
        <View style={styles.center}>
          <AppText style={styles.empty}>{t('social.listLoadError')}</AppText>
          <Pressable onPress={() => void query.refetch()}>
            <AppText style={styles.retry}>{t('common.retry')}</AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SocialUserListRow
              displayName={item.displayName}
              userName={item.userName}
              avatarUrl={item.avatarUrl}
              onPress={() => openSocialProfile(router, item.id)}
            />
          )}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<AppText style={styles.empty}>{t('social.noUsers')}</AppText>}
          ListFooterComponent={
            query.isFetchingNextPage ? (
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: spacing.xl,
  },
  footer: { paddingVertical: spacing.lg },
  retry: { color: colors.accent, fontWeight: '600' },
});
