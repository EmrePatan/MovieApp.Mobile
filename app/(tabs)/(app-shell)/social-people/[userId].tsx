import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { normalizeRouteParam } from '@/features/navigation/normalize-route-param';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { SocialPersonCard } from '@/features/social/components/SocialPersonCard';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import {
  useSocialFollowers,
  useSocialFollowing,
  useSocialProfile,
} from '@/features/social/hooks/useSocialQueries';
import { openSocialProfile } from '@/features/social/navigation/open-social-profile';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { IconEmptyState } from '@/components/common/IconEmptyState';

type PeopleTab = 'followers' | 'following';

export default function SocialPeopleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ userId: string | string[]; type?: string | string[] }>();
  const userId = useMemo(() => normalizeRouteParam(params.userId), [params.userId]);
  const initialType = useMemo(() => normalizeRouteParam(params.type), [params.type]);
  const [tab, setTab] = useState<PeopleTab>(
    initialType === 'following' ? 'following' : 'followers',
  );
  const [filter, setFilter] = useState('');
  const isFollowers = tab === 'followers';
  const profile = useSocialProfile(userId);
  const followers = useSocialFollowers(userId, isFollowers);
  const following = useSocialFollowing(userId, !isFollowers);
  const query = isFollowers ? followers : following;

  const allItems = useMemo(() => query.data?.pages.flatMap((page) => page) ?? [], [query.data]);
  const needle = filter.trim().toLowerCase();
  const items = useMemo(
    () =>
      needle
        ? allItems.filter(
            (item) =>
              item.displayName.toLowerCase().includes(needle) ||
              item.userName.toLowerCase().includes(needle),
          )
        : allItems,
    [allItems, needle],
  );

  const tabs: { id: PeopleTab; label: string; count?: number }[] = [
    { id: 'followers', label: t('social.followers'), count: profile.data?.followersCount },
    { id: 'following', label: t('social.following'), count: profile.data?.followingCount },
  ];

  const header = (
    <View style={styles.controls}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {tabs.map((item) => {
          const active = item.id === tab;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setTab(item.id);
                setFilter('');
              }}
              style={[styles.tab, active && styles.tabActive]}
            >
              <AppText style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
                {item.label}
              </AppText>
              {item.count != null ? (
                <AppText style={[styles.tabCount, active && styles.tabCountActive]}>
                  {item.count}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.filter}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder={t('social.filterPeople')}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.filterInput}
          accessibilityLabel={t('social.filterPeople')}
        />
        {filter ? (
          <Pressable onPress={() => setFilter('')} hitSlop={8} accessibilityRole="button">
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <SocialSubscreenHeader
        title={
          profile.data?.displayName ?? (isFollowers ? t('social.followers') : t('social.following'))
        }
        subtitle={profile.data ? `@${profile.data.userName}` : undefined}
        onBack={() => router.back()}
      />
      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : query.isError && allItems.length === 0 ? (
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
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <SocialPersonCard user={item} onPress={() => openSocialProfile(router, item.id)} />
          )}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<IconEmptyState icon="people-outline" title={t('social.noUsers')} />}
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  controls: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panelInput,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: glass.accentFill,
    borderColor: glass.accentBorder,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  tabLabelActive: { color: colors.textPrimary },
  tabCount: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  tabCountActive: { color: colors.accentStrong },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 42,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panelInput,
  },
  filterInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
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
