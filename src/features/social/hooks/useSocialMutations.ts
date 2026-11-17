import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import type { SocialPrivacySettings } from '../types';
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
    unblock: useMutation({ mutationFn: () => unblockSocialUser(userId), onSuccess: invalidate, onError: () => showSocialMutationError(t('social.operationFailed'), t('social.unblockFailed')) }),
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
  return useMutation({
    mutationFn: ({ activityId, isLiked }: { activityId: string; isLiked: boolean }) =>
      isLiked ? unlikeSocialActivity(activityId) : likeSocialActivity(activityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'profile-activities'] });
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.likeFailed')),
  });
}

export function useCreateSocialComment(activityId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: string | null }) =>
      createSocialComment(activityId, content, parentCommentId),
    onSuccess: (_comment, variables) => {
      // A reply also changes its parent's repliesCount, so refresh every comment thread for this activity.
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'comments', activityId] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] });
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
    },
    onError: () => showSocialMutationError(t('social.operationFailed'), t('social.deleteCommentFailed')),
  });
}

export function useToggleSocialCommentLike(activityId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) =>
      isLiked ? unlikeSocialComment(commentId) : likeSocialComment(commentId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'comments', activityId] }),
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
