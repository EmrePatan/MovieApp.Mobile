import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { useSocialFollowers, useSocialFollowing } from '@/features/social/hooks/useSocialQueries';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SocialPeopleScreen() {
  const router = useRouter();
  const { userId, type } = useLocalSearchParams<{ userId: string; type?: string }>();
  const isFollowers = type !== 'following';
  const followers = useSocialFollowers(userId, isFollowers);
  const following = useSocialFollowing(userId, !isFollowers);
  const query = isFollowers ? followers : following;
  const items = query.data?.pages.flatMap(page => page) ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><AppText variant="body">‹ Geri</AppText></Pressable>
        <AppText variant="title">{isFollowers ? 'Takipçiler' : 'Takip ettikleri'}</AppText>
      </View>
      {query.isLoading ? <View style={styles.center}><ActivityIndicator color={colors.accent} /></View> :
        query.isError ? <View style={styles.center}><AppText variant="bodySmall" muted>Liste yüklenemedi.</AppText></View> :
          <FlatList data={items} keyExtractor={item => item.id} contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => router.push(`/(tabs)/(app-shell)/social-profile/${item.id}`)}>
                <View style={styles.avatar}><AppText variant="body">{item.displayName.slice(0, 1).toUpperCase()}</AppText></View>
                <View style={styles.copy}><AppText variant="body">{item.displayName}</AppText><AppText variant="caption" muted>@{item.userName}</AppText></View>
              </Pressable>
            )}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.footer} /> : null}
            ListEmptyComponent={<AppText variant="bodySmall" muted center>Henüz kullanıcı yok.</AppText>}
          />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.md },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingVertical: spacing.lg },
});
