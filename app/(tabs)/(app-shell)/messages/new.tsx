import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { useCreateDirectConversation } from '@/features/messages/hooks/useMessageMutations';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { SocialUserListRow } from '@/features/social/components/SocialUserListRow';
import { useSocialUserSearch } from '@/features/social/hooks/useSocialQueries';
import { useSuggestedPeople } from '@/features/social/hooks/useSuggestedPeople';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';
import { IconEmptyState } from '@/components/common/IconEmptyState';

export default function NewDirectMessageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const createConversation = useCreateDirectConversation();
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);
  const results = useSocialUserSearch(debouncedQuery);
  const resultItems = results.data?.pages.flatMap((page) => page) ?? [];
  const suggested = useSuggestedPeople();
  const showSuggestions = debouncedQuery.length < 2;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <SocialSubscreenHeader title={t('messages.searchTitle')} onBack={() => router.back()} />
      <View style={styles.searchWrap}>
        <View style={styles.inputRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            accessibilityLabel={t('messages.searchPlaceholder')}
            value={query}
            onChangeText={setQuery}
            placeholder={t('messages.searchPlaceholder')}
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
        data={showSuggestions ? suggested.people : resultItems}
        ListHeaderComponent={
          showSuggestions && suggested.people.length > 0 ? (
            <AppText style={styles.sectionLabel}>{t('extras.suggestedPeople')}</AppText>
          ) : null
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <SocialUserListRow
            userId={item.id}
            displayName={item.displayName}
            userName={item.userName}
            avatarUrl={item.avatarUrl}
            onPress={() => {
              if (!createConversation.isPending) {
                createConversation.mutate(item.id);
              }
            }}
            trailing={<Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accentStrong} />}
          />
        )}
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage) {
            void results.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          debouncedQuery.length < 2 ? (
            <IconEmptyState icon="search-outline" title={t('messages.minSearchCharacters')} />
          ) : results.isError ? (
            <View style={styles.error}>
              <AppText style={styles.empty}>{t('messages.searchFailed')}</AppText>
              <Pressable onPress={() => void results.refetch()}>
                <AppText style={styles.retry}>{t('common.retry')}</AppText>
              </Pressable>
            </View>
          ) : results.isLoading ? null : (
            <IconEmptyState icon="people-outline" title={t('messages.noSearchResults')} />
          )
        }
      />
      {createConversation.isPending ? (
        <View style={styles.pending}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
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
    minHeight: 42,
    paddingHorizontal: spacing.md,
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
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingBottom: spacing.xs,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: spacing.xl,
  },
  error: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  retry: { color: colors.accent, fontWeight: '600' },
  pending: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 5, 8, 0.35)',
  },
});
