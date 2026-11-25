import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  acceptSocialFollowRequest,
  createSocialComment,
  deleteSocialComment,
  likeSocialActivity,
  unlikeSocialActivity,
  likeSocialComment,
  unlikeSocialComment,
  reportSocialContent,
  markSocialNotificationRead,
  markAllSocialNotificationsRead,
  blockSocialUser,
  followSocialUser,
  rejectSocialFollowRequest,
  unblockSocialUser,
  unfollowSocialUser,
  updateSocialPrivacy,
} from '../api/social-api';
import type { SocialFeedPage, SocialPrivacySettings } from '../types';
import { getUiFormatLocaleTag } from '@/i18n';
import { socialQueryKeys } from './social-query-keys';

function showSocialMutationError(title: string, message: string) {
  Alert.alert(title, message);
}

export function useFollowSocialUser(userId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: () => followSocialUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(userId) });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.followRequestFailed')),
  });
}

export function useUnfollowSocialUser(userId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: () => unfollowSocialUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(userId) });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.unfollowFailed')),
  });
}

export function useSocialFollowRequestMutations() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
  return {
    accept: useMutation({ mutationFn: acceptSocialFollowRequest, onSuccess: invalidate, onError: () => showSocialMutationError(t('social.operationFailed'), t('social.requestAcceptFailed')) }),
    reject: useMutation({ mutationFn: rejectSocialFollowRequest, onSuccess: invalidate, onError: () => showSocialMutationError(t('social.operationFailed'), t('social.requestRejectFailed')) }),
  };
}

export function useSocialBlockMutations(userId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
  };
  return {
    block: useMutation({ mutationFn: () => blockSocialUser(userId), onSuccess: invalidate, onError: () => showSocialMutationError(t('social.operationFailed'), t('social.blockFailed')) }),
  };
}

export function useUpdateSocialPrivacy() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (settings: SocialPrivacySettings) => updateSocialPrivacy(settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(socialQueryKeys.privacy(), settings);
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.privacySaveFailed')),
  });
}

export function useToggleSocialActivityLike() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const feedKey = [...socialQueryKeys.all, 'feed'] as const;
  const profileActivitiesKey = [...socialQueryKeys.all, 'profile-activities'] as const;

  const updateActivityLike = (
    data: InfiniteData<SocialFeedPage> | undefined,
    activityId: string,
    isLiked: boolean,
  ): InfiniteData<SocialFeedPage> | undefined => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        items: page.items.map(item => item.id !== activityId ? item : {
          ...item,
          isLikedByMe: isLiked,
          likesCount: Math.max(0, item.likesCount + (isLiked ? 1 : -1)),
        }),
      })),
    };
  };

  return useMutation({
    mutationFn: ({ activityId, isLiked }: { activityId: string; isLiked: boolean }) =>
      isLiked ? unlikeSocialActivity(activityId) : likeSocialActivity(activityId),
    onMutate: async ({ activityId, isLiked }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: feedKey }),
        queryClient.cancelQueries({ queryKey: profileActivitiesKey }),
      ]);
      const previousFeeds = queryClient.getQueriesData<InfiniteData<SocialFeedPage>>({
        queryKey: feedKey,
      });
      const previousProfiles = queryClient.getQueriesData<InfiniteData<SocialFeedPage>>({
        queryKey: profileActivitiesKey,
      });
      queryClient.setQueriesData<InfiniteData<SocialFeedPage>>(
        { queryKey: feedKey },
        current => updateActivityLike(current, activityId, !isLiked),
      );
      queryClient.setQueriesData<InfiniteData<SocialFeedPage>>(
        { queryKey: profileActivitiesKey },
        current => updateActivityLike(current, activityId, !isLiked),
      );
      return { previousFeeds, previousProfiles };
    },
    onError: (_error, _variables, context) => {
      context?.previousFeeds?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousProfiles?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      showSocialMutationError(t('social.operationFailed'), t('social.likeFailed'));
    },
  });
}

export function useCreateSocialComment(activityId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: string | null }) =>
      createSocialComment(activityId, content, parentCommentId, getUiFormatLocaleTag()),
    onSuccess: () => {
      // A reply also changes its parent's repliesCount, so refresh every comment thread for this activity.
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'comments', activityId] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'profile-activities'] });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.commentFailed')),
  });
}

export function useDeleteSocialComment(activityId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: deleteSocialComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'comments', activityId] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'profile-activities'] });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.deleteCommentFailed')),
  });
}

export function useToggleSocialCommentLikeFeed() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({
      commentId,
      isLiked,
    }: {
      commentId: string;
      isLiked: boolean;
      activityId: string;
    }) => (isLiked ? unlikeSocialComment(commentId) : likeSocialComment(commentId)),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...socialQueryKeys.all, 'comments', variables.activityId],
      });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'profile-activities'] });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.commentLikeFailed')),
  });
}

export function useToggleSocialCommentLike(activityId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) =>
      isLiked ? unlikeSocialComment(commentId) : likeSocialComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'comments', activityId] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'profile-activities'] });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.commentLikeFailed')),
  });
}

export function useReportSocialContent() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: reportSocialContent,
    onSuccess: () => Alert.alert(t('social.reportSuccessTitle'), t('social.reportSuccessMessage')),
    onError: () => Alert.alert(t('social.reportFailedTitle'), t('social.reportFailedMessage')),
  });
}

export function useMarkSocialNotificationRead() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: markSocialNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications', 'unread-count'] });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.notificationReadFailed')),
  });
}

export function useMarkAllSocialNotificationsRead() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: markAllSocialNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications', 'unread-count'] });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.notificationsReadFailed')),
  });
}

export function useUnblockSocialUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (userId: string) => unblockSocialUser(userId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all }),
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.unblockFailed')),
  });
}
