import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useSocialComments } from '@/features/social/hooks/useSocialQueries';
import { useCreateSocialComment, useToggleSocialCommentLike } from '@/features/social/hooks/useSocialMutations';
import type { SocialComment } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function CommentCard({ comment, onLike, onReply, isLiking }: {
  comment: SocialComment;
  onLike: (comment: SocialComment) => void;
  onReply: (comment: SocialComment) => void;
  isLiking: boolean;
}) {
  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.avatar}><AppText variant="subtitle">{comment.displayName.slice(0, 1).toUpperCase()}</AppText></View>
        <View style={styles.authorBlock}>
          <AppText variant="body" style={styles.authorName}>{comment.displayName}</AppText>
          <AppText variant="caption" muted>@{comment.userName} · {new Date(comment.createdAt).toLocaleDateString()}</AppText>
        </View>
      </View>
      <AppText variant="body">{comment.content}</AppText>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" disabled={isLiking} onPress={() => onLike(comment)} style={styles.actionButton}>
          <AppText variant="bodySmall" style={comment.isLikedByMe ? styles.liked : undefined}>{comment.isLikedByMe ? '♥' : '♡'} {comment.likesCount}</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onReply(comment)} style={styles.actionButton}>
          <AppText variant="bodySmall">Yanıtla · {comment.repliesCount}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default function SocialCommentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ activityId: string | string[]; parentCommentId?: string | string[] }>();
  const activityId = firstParam(params.activityId) ?? '';
  const parentCommentId = firstParam(params.parentCommentId) ?? null;
  const [draft, setDraft] = useState('');
  const comments = useSocialComments(activityId, parentCommentId);
  const createComment = useCreateSocialComment(activityId);
  const toggleLike = useToggleSocialCommentLike(activityId);
  const items = useMemo(() => comments.data?.items ?? [], [comments.data?.items]);

  const submit = () => {
    const content = draft.trim();
    if (!content || createComment.isPending) return;
    createComment.mutate({ content, parentCommentId }, { onSuccess: () => setDraft('') });
  };
  const openReplies = (comment: SocialComment) => {
    router.push(`/(tabs)/(app-shell)/social-comments/${activityId}?parentCommentId=${comment.id}`);
  };

  if (!activityId) {
    return <SafeAreaView style={styles.screen}><View style={styles.center}><AppText variant="bodySmall" muted>Yorum bağlantısı geçersiz.</AppText></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityRole="button"><AppText variant="body" style={styles.back}>‹ Geri</AppText></Pressable>
          <AppText variant="title">{parentCommentId ? 'Yanıtlar' : 'Yorumlar'}</AppText>
          {parentCommentId ? <Pressable onPress={() => router.replace(`/(tabs)/(app-shell)/social-comments/${activityId}`)}><AppText variant="caption" style={styles.rootLink}>Tüm yorumlar</AppText></Pressable> : null}
        </View>
        {comments.isLoading ? <View style={styles.center}><ActivityIndicator color={colors.accent} /></View> : comments.isError ? (
          <View style={styles.center}><AppText variant="bodySmall" muted>Yorumlar yüklenemedi.</AppText><AppButton title="Tekrar dene" variant="secondary" onPress={() => void comments.refetch()} /></View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <CommentCard comment={item}
              onLike={comment => toggleLike.mutate({ commentId: comment.id, isLiked: comment.isLikedByMe })}
              onReply={openReplies}
              isLiking={toggleLike.isPending && toggleLike.variables?.commentId === item.id} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<View style={styles.center}><AppText variant="bodySmall" muted>{parentCommentId ? 'Henüz yanıt yok.' : 'Henüz yorum yok. İlk yorumu sen yaz.'}</AppText></View>}
          />
        )}
        <View style={styles.composer}>
          <TextInput value={draft} onChangeText={setDraft} placeholder={parentCommentId ? 'Yanıtını yaz…' : 'Yorumunu yaz…'}
            placeholderTextColor={colors.textMuted} multiline maxLength={4000} style={styles.input} textAlignVertical="top" />
          <AppButton title="Gönder" onPress={submit} disabled={!draft.trim() || createComment.isPending} loading={createComment.isPending} />
        </View>
        {createComment.isError ? <AppText variant="caption" style={styles.error}>Yorum gönderilemedi. Tekrar dene.</AppText> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  back: { color: colors.accent }, rootLink: { color: colors.accent },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md, flexGrow: 1 },
  commentCard: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, gap: spacing.sm },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  authorBlock: { flex: 1 }, authorName: { fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg }, actionButton: { paddingVertical: spacing.xs },
  liked: { color: colors.accent },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  input: { flex: 1, minHeight: 42, maxHeight: 120, borderRadius: 12, backgroundColor: colors.inputBackground, color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  error: { color: colors.error, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
});