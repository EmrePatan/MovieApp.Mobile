import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAuth } from '@/auth/useAuth';
import { useSocialComments } from '@/features/social/hooks/useSocialQueries';
import { useCreateSocialComment, useDeleteSocialComment, useToggleSocialCommentLike } from '@/features/social/hooks/useSocialMutations';
import type { SocialComment } from '@/features/social/types';
import { useAuth } from '@/auth/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SocialCommentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const comments = useSocialComments(activityId, parentCommentId);
  const createComment = useCreateSocialComment(activityId);
  const deleteComment = useDeleteSocialComment(activityId);
  const toggleLike = useToggleSocialCommentLike(activityId);

  const handleSubmit = useCallback(() => {
    const content = draft.trim();
    if (!content || createComment.isPending) return;
    createComment.mutate({ content, parentCommentId }, { onSuccess: () => setDraft('') });
  }, [createComment, draft, parentCommentId]);

  const handleReply = useCallback((comment: SocialComment) => {
    setParentCommentId(comment.id);
  }, []);

  const renderItem = useCallback(({ item }: { item: SocialComment }) => (
    <View style={styles.comment}>
      <View style={styles.commentHeader}>
        <View style={styles.avatar}><AppText variant="body">{item.displayName.slice(0, 1).toUpperCase()}</AppText></View>
        <View style={styles.author}>
          <AppText variant="body">{item.displayName}</AppText>
          <AppText variant="caption" muted>@{item.userName}</AppText>
        </View>
      </View>
      <AppText variant="body">{item.content}</AppText>
      <View style={styles.actions}>
        <Pressable onPress={() => toggleLike.mutate({ commentId: item.id, isLiked: item.isLikedByMe })}>
          <AppText variant="caption" style={item.isLikedByMe ? styles.liked : undefined}>
            {item.isLikedByMe ? '♥' : '♡'} {item.likesCount}
          </AppText>
        </Pressable>
        <Pressable onPress={() => handleReply(item)}>
          <AppText variant="caption" muted >{t('social.reply')} · {item.repliesCount}</AppText>
        </Pressable>
        {item.userId === user?.id ? (
          {item.userId === user?.id ? <Pressable onPress={() => deleteComment.mutate(item.id)}>
            <AppText variant="caption" muted>{t('social.delete')}</AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  ), [deleteComment, handleReply, t, toggleLike, user?.id]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => parentCommentId ? setParentCommentId(null) : router.back()}>
          <AppText variant="body">‹ {parentCommentId ? t('social.comments') : t('social.back')}</AppText>
        </Pressable>
        <AppText variant="title">{parentCommentId ? t('social.replies') : t('social.comments')}</AppText>
      </View>
      {comments.isLoading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.accent} /></View>
      ) : comments.isError ? (
        <View style={styles.loading}>
          <AppText variant="bodySmall" muted>{t('social.loadCommentsError')}</AppText>
          <AppButton title={t('common.tryAgain')} variant="secondary" onPress={() => void comments.refetch()} />
        </View>
      ) : (
        <FlatList
          data={comments.data?.items ?? []}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<AppText variant="bodySmall" muted center>{t('social.noComments')}</AppText>}
        />
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={parentCommentId ? t('social.writeReply') : t('social.writeComment')}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
            style={styles.input}
          />
          <Pressable disabled={!draft.trim() || createComment.isPending} onPress={handleSubmit} style={styles.send}>
            <AppText variant="bodySmall" style={styles.sendText}>{t('social.send')}</AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  comment: { padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface, gap: spacing.sm },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  author: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  liked: { color: colors.accent },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  input: { flex: 1, minHeight: 42, maxHeight: 120, color: colors.textPrimary, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  send: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: 12, backgroundColor: colors.accent },
  sendText: { color: colors.textPrimary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
