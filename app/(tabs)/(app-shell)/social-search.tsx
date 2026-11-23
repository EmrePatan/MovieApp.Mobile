import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { SocialUserListRow } from '@/features/social/components/SocialUserListRow';
import { useSocialUserSearch } from '@/features/social/hooks/useSocialQueries';
import { openSocialProfile } from '@/features/social/navigation/open-social-profile';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';
import { IconEmptyState } from '@/components/common/IconEmptyState';

export default function SocialSearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);
  const results = useSocialUserSearch(debouncedQuery);
  const resultItems = results.data?.pages.flatMap((page) => page) ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <SocialSubscreenHeader title={t('social.searchTitle')} onBack={() => router.back()} />
      <View style={styles.searchWrap}>
        <View style={styles.inputRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            accessibilityLabel={t('social.searchPlaceholder')}
            value={query}
            onChangeText={setQuery}
            placeholder={t('social.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>
      </View>
      {results.isFetching && !results.isFetchingNextPage ? (
        <ActivityIndicator color={colors.accent} style={styles.loading} />
      ) : null}
      <FlatList
        data={resultItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SocialUserListRow
            displayName={item.displayName}
            userName={item.userName}
            avatarUrl={item.avatarUrl}
            meta={
              item.followStatus === 'Accepted'
                ? t('social.followed')
                : item.followStatus === 'Pending'
                  ? t('social.requestSent')
                  : undefined
            }
            onPress={() => openSocialProfile(router, item.id)}
          />
        )}
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage) void results.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          debouncedQuery.length < 2 ? (
            <IconEmptyState icon="search-outline" title={t('social.minSearchCharacters')} />
          ) : results.isError ? (
            <View style={styles.error}>
              <AppText style={styles.empty}>{t('social.searchFailed')}</AppText>
              <Pressable onPress={() => void results.refetch()}>
                <AppText style={styles.retry}>{t('common.retry')}</AppText>
              </Pressable>
            </View>
          ) : results.isLoading ? null : (
            <IconEmptyState icon="people-outline" title={t('social.noSearchResults')} />
          )
        }
        ListFooterComponent={
          results.isFetchingNextPage ? (
            <ActivityIndicator color={colors.accent} style={styles.loading} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    backgroundColor: glass.panelInput,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  list: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  loading: { padding: spacing.md },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: spacing.xl,
  },
  error: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  retry: { color: colors.accent, fontWeight: '600' },
});
