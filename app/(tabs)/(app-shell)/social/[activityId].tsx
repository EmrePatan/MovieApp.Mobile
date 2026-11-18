import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAuth } from '@/auth/useAuth';
import { useSocialComments, useSocialFeed } from '@/features/social/hooks/useSocialQueries';
import { useCreateSocialComment, useDeleteSocialComment, useReportSocialContent, useToggleSocialCommentLike } from '@/features/social/hooks/useSocialMutations';
import type { SocialComment } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { resolveImageUri } from '@/utils/image-url';

export default function SocialCommentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  const [parentStack, setParentStack] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const comments = useSocialComments(activityId, parentCommentId);
  const feed = useSocialFeed();
  const activity = feed.data?.pages.flatMap(page => page.items).find(item => item.id === activityId);
  const commentItems = comments.data?.pages.flatMap(page => page.items) ?? [];
  const createComment = useCreateSocialComment(activityId);
  const deleteComment = useDeleteSocialComment(activityId);
  const toggleLike = useToggleSocialCommentLike(activityId);
  const report = useReportSocialContent();

  const handleSubmit = useCallback(() => {
    const content = draft.trim();
    if (!content || createComment.isPending) return;
    createComment.mutate({ content, parentCommentId }, { onSuccess: () => setDraft('') });
  }, [createComment, draft, parentCommentId]);

  const handleReply = useCallback((comment: SocialComment) => {
    setParentStack(current => [...current, comment.id]);
    setParentCommentId(comment.id);
  }, []);

  const handleBack = useCallback(() => {
    if (parentStack.length === 0) {
      router.back();
      return;
    }

    const nextStack = parentStack.slice(0, -1);
    setParentStack(nextStack);
    setParentCommentId(nextStack[nextStack.length - 1] ?? null);
  }, [parentStack, router]);

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
        {item.userId !== user?.id ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`${item.isLikedByMe ? t('social.unlike') : t('social.like')} ${item.likesCount}`} disabled={toggleLike.isPending && toggleLike.variables?.commentId === item.id} onPress={() => toggleLike.mutate({ commentId: item.id, isLiked: item.isLikedByMe })}>
            <AppText variant="caption" style={item.isLikedByMe ? styles.liked : undefined}>
              {item.isLikedByMe ? '♥' : '♡'} {item.likesCount}
            </AppText>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel={`${t('social.reply')} ${item.repliesCount}`} onPress={() => handleReply(item)}>
          <AppText variant="caption" muted >{t('social.reply')} · {item.repliesCount}</AppText>
        </Pressable>
        {item.userId !== user?.id ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('social.report')} onPress={() => Alert.alert(
            t('social.commentReportTitle'),
            t('social.chooseReportReason'),
            [
              { text: t('social.spam'), onPress: () => report.mutate({ targetType: 'Comment', targetId: item.id, reason: 'Spam' }) },
              { text: t('social.inappropriate'), onPress: () => report.mutate({ targetType: 'Comment', targetId: item.id, reason: 'Inappropriate' }) },
              { text: t('social.harassment'), onPress: () => report.mutate({ targetType: 'Comment', targetId: item.id, reason: 'Harassment' }) },
              { text: t('social.cancel'), style: 'cancel' },
            ],
          )}>
            <AppText variant="caption" muted>{t('social.report')}</AppText>
          </Pressable>
        ) : null}
        {item.userId === user?.id ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('social.delete')} disabled={deleteComment.isPending} onPress={() => Alert.alert(
            t('social.deleteCommentTitle'),
            t('social.deleteCommentMessage'),
            [
              { text: t('social.cancel'), style: 'cancel' },
              { text: t('social.delete'), style: 'destructive', onPress: () => deleteComment.mutate(item.id) },
            ],
          )}>
            <AppText variant="caption" muted>{t('social.delete')}</AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  ), [deleteComment, handleReply, report, t, toggleLike, user?.id]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('social.back')} onPress={handleBack}>
          <AppText variant="body">‹ {parentStack.length > 1 ? t('social.replies') : parentCommentId ? t('social.comments') : t('social.back')}</AppText>
        </Pressable>
        <AppText variant="title">{parentCommentId ? t('social.replies') : t('social.comments')}</AppText>
      </View>
      {comments.isError && commentItems.length > 0 ? (
        <View style={styles.inlineError}>
          <AppText variant="caption" muted>{t('social.loadCommentsError')}</AppText>
          <AppButton title={t('common.tryAgain')} variant="secondary" onPress={() => void comments.refetch()} />
        </View>
      ) : null}
      {comments.isLoading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.accent} /></View>
      ) : comments.isError && commentItems.length === 0 ? (
        <View style={styles.loading}>
          <AppText variant="bodySmall" muted>{t('social.loadCommentsError')}</AppText>
          <AppButton title={t('common.tryAgain')} variant="secondary" onPress={() => void comments.refetch()} />
        </View>
      ) : (
        <FlatList
          data={commentItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (comments.hasNextPage && !comments.isFetchingNextPage) void comments.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={comments.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.loading} /> : comments.isFetchNextPageError ? (
            <View style={styles.loading}>
              <AppText variant="caption" muted>{t('social.nextPageError')}</AppText>
              <AppButton title={t('common.retry')} variant="secondary" onPress={() => void comments.fetchNextPage()} />
            </View>
          ) : null}
          ListHeaderComponent={activity ? (
            <View style={styles.activityDetail}>
              <View style={styles.commentHeader}>
                <View style={styles.avatar}><AppText variant="body">{activity.displayName.slice(0, 1).toUpperCase()}</AppText></View>
                <View style={styles.author}>
                  <AppText variant="body">{activity.displayName}</AppText>
                  <AppText variant="caption" muted>@{activity.userName} · {new Date(activity.createdAt).toLocaleDateString()}</AppText>
                </View>
              </View>
              <AppText variant="body">{activity.displayName} {t('social.activity.generic')}</AppText>
              <View style={styles.activityContent}>
                {activity.posterPath ? <Image source={{ uri: resolveImageUri(activity.posterPath, 'w300') ?? undefined }} style={styles.activityPoster} /> : null}
                <View style={styles.author}>
                  <AppText variant="subtitle">{activity.targetTitle}</AppText>
                  {activity.targetSubtitle ? <AppText variant="caption" muted>{activity.targetSubtitle}</AppText> : null}
                  {activity.ratingScore !== null ? <AppText variant="bodySmall">★ {activity.ratingScore}/10</AppText> : null}
                  {activity.reviewExcerpt ? <AppText variant="bodySmall" muted>{activity.reviewExcerpt}</AppText> : null}
                </View>
              </View>
              <AppText variant="caption" muted>{t('social.commentsCount')} · {activity.commentsCount}</AppText>
            </View>
          ) : null}
          ListEmptyComponent={<AppText variant="bodySmall" muted center>{t('social.noComments')}</AppText>}
        />
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}>
          <TextInput
            accessibilityLabel={parentCommentId ? t('social.writeReply') : t('social.writeComment')}
            value={draft}
            onChangeText={setDraft}
            placeholder={parentCommentId ? t('social.writeReply') : t('social.writeComment')}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
            style={styles.input}
          />
          <Pressable accessibilityRole="button" accessibilityLabel={t('social.send')} disabled={!draft.trim() || createComment.isPending} onPress={handleSubmit} style={styles.send}>
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
  activityDetail: { padding: spacing.md, marginBottom: spacing.md, borderRadius: 18, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, gap: spacing.md },
  activityContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: 14, backgroundColor: colors.surfaceElevated, gap: spacing.md },
  activityPoster: { width: 82, height: 120, borderRadius: 10, backgroundColor: colors.surface },
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
  inlineError: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, gap: spacing.sm },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
