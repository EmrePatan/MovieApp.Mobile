import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { useSocialUserSearch } from '@/features/social/hooks/useSocialQueries';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SocialSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);
  const results = useSocialUserSearch(debouncedQuery);
  const resultItems = results.data?.pages.flatMap(page => page) ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><AppText variant="body">‹ Geri</AppText></Pressable>
        <AppText variant="title">Kullanıcı bul</AppText>
        <TextInput value={query} onChangeText={setQuery} placeholder="İsim veya kullanıcı adı"
          placeholderTextColor={colors.textMuted} autoCapitalize="none" style={styles.input} />
      </View>
      {results.isFetching ? <ActivityIndicator color={colors.accent} style={styles.loading} /> : null}
      <FlatList
        data={resultItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/(tabs)/(app-shell)/social-profile/${item.id}`)}>
            <View style={styles.avatar}><AppText variant="body">{item.displayName.slice(0, 1).toUpperCase()}</AppText></View>
            <View style={styles.copy}>
              <AppText variant="body">{item.displayName}</AppText>
              <AppText variant="caption" muted>@{item.userName}</AppText>
            </View>
            <AppText variant="caption" muted>{item.followStatus === 'Accepted' ? 'Takip ediliyor' : item.followStatus === 'Pending' ? 'İstek gönderildi' : ''}</AppText>
          </Pressable>
        )}
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage) void results.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={results.isError && resultItems.length > 0 ? <View style={styles.error}><AppText variant="caption" muted>Arama sonuçları yenilenemedi.</AppText><Pressable onPress={() => void results.refetch()}><AppText variant="caption" style={styles.retry}>Tekrar dene</AppText></Pressable></View> : null}
        ListFooterComponent={results.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.loading} /> : results.isFetchNextPageError ? <View style={styles.error}><AppText variant="caption" muted>Sonraki sayfa yüklenemedi.</AppText><Pressable onPress={() => void results.fetchNextPage()}><AppText variant="caption" style={styles.retry}>Tekrar dene</AppText></Pressable></View> : null}
        ListEmptyComponent={debouncedQuery.length < 2 ? <AppText variant="bodySmall" muted center>En az 2 karakter yaz.</AppText> :
          results.isError ? <View style={styles.error}><AppText variant="bodySmall" muted center>Arama yapılamadı.</AppText><Pressable onPress={() => void results.refetch()}><AppText variant="caption" style={styles.retry}>Tekrar dene</AppText></Pressable></View> :
          results.isLoading ? null : <AppText variant="bodySmall" muted center>Sonuç bulunamadı.</AppText>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.md },
  input: { color: colors.textPrimary, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  loading: { padding: spacing.md },
  error: { alignItems: 'center', gap: spacing.sm },
  retry: { color: colors.accent },
});
