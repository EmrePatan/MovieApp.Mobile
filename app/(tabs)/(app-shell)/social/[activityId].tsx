import { useCallback, useMemo, useRef, useState } from 'react';
import { normalizeRouteParam } from '@/features/navigation/normalize-route-param';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAuth } from '@/auth/useAuth';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { useSocialActivity, useSocialComments } from '@/features/social/hooks/useSocialQueries';
import { openSocialActivityCatalog } from '@/features/social/navigation/open-social-activity-catalog';
import {
  useCreateSocialComment,
  useDeleteSocialComment,
  useReportSocialContent,
  useToggleSocialCommentLike,
} from '@/features/social/hooks/useSocialMutations';
import type { SocialComment } from '@/features/social/types';
import { buildSocialCommentBody } from '@/features/social/utils/social-comment-media';
import { SocialActivityContextStrip } from '@/features/social/components/SocialActivityContextStrip';
import { SocialCommentContent } from '@/features/social/components/SocialCommentContent';
import { SocialCommentThreadRow } from '@/features/social/components/SocialCommentThreadRow';
import { SocialCommentParentBanner } from '@/features/social/components/SocialCommentParentBanner';
import { SocialCommentComposer } from '@/features/social/components/SocialCommentComposer';
import { SocialConfirmActionSheet } from '@/features/social/components/SocialConfirmActionSheet';
import { SocialReportReasonSheet } from '@/features/social/components/SocialReportReasonSheet';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { useSocialReportReasonSheet } from '@/features/social/hooks/useSocialReportReasonSheet';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { socialFeedTheme } from '@/features/social/components/social-feed-theme';


type ThreadFrame = {
  parentId: string;
  parent: SocialComment;
};

function placeholderParent(activityId: string, parentId: string): SocialComment {
  return {
    id: parentId,
    activityId,
    userId: '',
    userName: '',
    displayName: '…',
    avatarUrl: null,
    parentCommentId: null,
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    likesCount: 0,
    repliesCount: 0,
    isLikedByMe: false,
  };
}

/**
 * Product rule: reviews + root comments, with one reply level under a root comment.
 */
export default function SocialCommentsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();
  useAuthFonts();
  const params = useLocalSearchParams<{
    activityId: string | string[];
    parentCommentId?: string | string[];
  }>();
  const activityId = useMemo(() => normalizeRouteParam(params.activityId), [params.activityId]);
  const parentCommentIdParam = useMemo(
    () => normalizeRouteParam(params.parentCommentId),
    [params.parentCommentId],
  );

  const parentCommentId = parentCommentIdParam?.trim() || null;
  const drilledInFromCommentsRef = useRef(false);

  const [draftText, setDraftText] = useState('');
  const [draftSpoiler, setDraftSpoiler] = useState(false);

  const comments = useSocialComments(activityId, parentCommentId);
  const rootComments = useSocialComments(activityId, null);
  const activityQuery = useSocialActivity(activityId);
  const activity = activityQuery.data;
  const commentItems = comments.data?.pages.flatMap((page) => page.items) ?? [];
  const rootItems = rootComments.data?.pages.flatMap((page) => page.items) ?? [];
  const thread = useMemo<ThreadFrame | null>(() => {
    if (!parentCommentId) return null;
    const parent = rootItems.find((item) => item.id === parentCommentId);
    return {
      parentId: parentCommentId,
      parent: parent ?? placeholderParent(activityId, parentCommentId),
    };
  }, [activityId, parentCommentId, rootItems]);
  const createComment = useCreateSocialComment(activityId);
  const deleteComment = useDeleteSocialComment(activityId);
  const toggleLike = useToggleSocialCommentLike(activityId);
  const report = useReportSocialContent();
  const { openCommentReport, reportSheetProps } = useSocialReportReasonSheet(report);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const syncRouteParent = useCallback(
    (nextParentId: string | null) => {
      router.setParams(
        nextParentId
          ? { parentCommentId: nextParentId }
          : { parentCommentId: undefined },
      );
    },
    [router],
  );

  const handleSubmit = useCallback(() => {
    const content = draftText.trim();
    if (!content || createComment.isPending) return;
    createComment.mutate(
      { content: buildSocialCommentBody(content, null, draftSpoiler), parentCommentId },
      {
        onSuccess: () => {
          setDraftText('');
          setDraftSpoiler(false);
        },
      },
    );
  }, [createComment, draftSpoiler, draftText, parentCommentId]);

  const openReplies = useCallback(
    (comment: SocialComment) => {
      if (thread) return;
      drilledInFromCommentsRef.current = true;
      syncRouteParent(comment.id);
    },
    [syncRouteParent, thread],
  );

  const handleOpenCatalog = useCallback(() => {
    if (activity) openSocialActivityCatalog(router, activity, { queryClient });
  }, [activity, queryClient, router]);

  const handleBack = useCallback(() => {
    if (!thread) {
      router.back();
      return;
    }

    // In-app drill: peel one layer back to root comments.
    if (drilledInFromCommentsRef.current) {
      drilledInFromCommentsRef.current = false;
      syncRouteParent(null);
      return;
    }

    // Deep link / notification landed directly on replies — leave the screen.
    router.back();
  }, [router, syncRouteParent, thread]);


  useFocusEffect(
    useCallback(() => {
      if (!thread) return undefined;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });
      return () => subscription.remove();
    }, [handleBack, thread]),
  );

  const screenTitle = thread ? t('social.replies') : t('social.comments');
  const isRootLevel = thread === null;

  const renderItem = useCallback(
    ({ item }: { item: SocialComment }) => (
      <SocialCommentThreadRow
        item={item}
        isOwnUser={item.userId === user?.id}
        isLikePending={toggleLike.isPending && toggleLike.variables?.commentId === item.id}
        canOpenReplies={isRootLevel}
        onLike={() => toggleLike.mutate({ commentId: item.id, isLiked: item.isLikedByMe })}
        onReply={() => {
          if (isRootLevel) openReplies(item);
        }}
        onReport={() => openCommentReport(item)}
        onDelete={() => setDeleteTargetId(item.id)}
      />
    ),
    [isRootLevel, openCommentReport, openReplies, toggleLike, user?.id],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SocialSubscreenHeader
          title={screenTitle}
          subtitle={
            activity
              ? `${activity.displayName} · ${activity.targetTitle || t('social.contentFallback')}`
              : undefined
          }
          onBack={handleBack}
        />

        {comments.isError && commentItems.length > 0 ? (
          <View style={styles.inlineError}>
            <AppText variant="caption" muted>
              {t('social.loadCommentsError')}
            </AppText>
            <AppButton
              title={t('common.tryAgain')}
              variant="secondary"
              onPress={() => void comments.refetch()}
            />
          </View>
        ) : null}

        {comments.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={socialFeedTheme.accent} />
          </View>
        ) : comments.isError && commentItems.length === 0 ? (
          <View style={styles.loading}>
            <AppText variant="bodySmall" muted>
              {t('social.loadCommentsError')}
            </AppText>
            <AppButton
              title={t('common.tryAgain')}
              variant="secondary"
              onPress={() => void comments.refetch()}
            />
          </View>
        ) : (
          <FlatList
            key={parentCommentId ?? 'root'}
            style={styles.flex}
            data={commentItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onEndReached={() => {
              if (comments.hasNextPage && !comments.isFetchingNextPage) void comments.fetchNextPage();
            }}
            onEndReachedThreshold={0.4}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {activity ? (
                  <SocialActivityContextStrip activity={activity} onPress={handleOpenCatalog} />
                ) : null}
                {activity?.reviewExcerpt?.trim() && !thread ? (
                  <View style={styles.reviewBody} testID="social-activity-review-body">
                    <SocialCommentContent content={activity.reviewExcerpt} density="thread" />
                  </View>
                ) : null}
                {thread ? <SocialCommentParentBanner comment={thread.parent} /> : null}
                {thread && commentItems.length > 0 ? (
                  <AppText style={styles.repliesLabel}>{t('social.replies')}</AppText>
                ) : null}
              </View>
            }
            ListFooterComponent={
              comments.isFetchingNextPage ? (
                <ActivityIndicator color={socialFeedTheme.accent} style={styles.footerLoader} />
              ) : comments.isFetchNextPageError ? (
                <View style={styles.footerError}>
                  <AppText variant="caption" muted>
                    {t('social.nextPageError')}
                  </AppText>
                  <AppButton
                    title={t('common.retry')}
                    variant="secondary"
                    onPress={() => void comments.fetchNextPage()}
                  />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <AppText variant="bodySmall" muted center style={styles.empty}>
                {t('social.noComments')}
              </AppText>
            }
          />
        )}

        <SocialCommentComposer
          draftText={draftText}
          placeholder={parentCommentId ? t('social.writeReply') : t('social.writeComment')}
          isSending={createComment.isPending}
          onChangeText={setDraftText}
          onSend={handleSubmit}
          isSpoiler={draftSpoiler}
          onToggleSpoiler={() => setDraftSpoiler((current) => !current)}
        />
      </KeyboardAvoidingView>
      <SocialReportReasonSheet {...reportSheetProps} />
      <SocialConfirmActionSheet
        visible={deleteTargetId !== null}
        title={t('social.deleteCommentTitle')}
        message={t('social.deleteCommentMessage')}
        confirmLabel={t('social.delete')}
        destructive
        confirmLoading={deleteComment.isPending}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (!deleteTargetId) return;
          deleteComment.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: socialFeedTheme.background },
  flex: { flex: 1, minHeight: 0 },
  list: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.md,
  },
  listHeader: {
    gap: spacing.md,
    marginBottom: spacing.xs,
    paddingTop: spacing.sm,
  },
  reviewBody: {
    paddingHorizontal: spacing.xs,
  },
  repliesLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: socialFeedTheme.textSecondary,
    marginTop: spacing.xs,
  },
  empty: {
    paddingVertical: spacing.xl,
  },
  footerLoader: {
    paddingVertical: spacing.md,
  },
  footerError: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
