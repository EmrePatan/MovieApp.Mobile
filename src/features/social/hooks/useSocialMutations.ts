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

export function useFollowSocialUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => followSocialUser(userId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(userId) }),
  });
}

export function useUnfollowSocialUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unfollowSocialUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(userId) });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
    },
  });
}

export function useSocialFollowRequestMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
  return {
    accept: useMutation({ mutationFn: acceptSocialFollowRequest, onSuccess: invalidate }),
    reject: useMutation({ mutationFn: rejectSocialFollowRequest, onSuccess: invalidate }),
  };
}

export function useSocialBlockMutations(userId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
  };
  return {
    block: useMutation({ mutationFn: () => blockSocialUser(userId), onSuccess: invalidate }),
    unblock: useMutation({ mutationFn: () => unblockSocialUser(userId), onSuccess: invalidate }),
  };
}

export function useUpdateSocialPrivacy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: SocialPrivacySettings) => updateSocialPrivacy(settings),
    onSuccess: (settings) => queryClient.setQueryData(socialQueryKeys.privacy(), settings),
  });
}

export function useToggleSocialActivityLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, isLiked }: { activityId: string; isLiked: boolean }) =>
      isLiked ? unlikeSocialActivity(activityId) : likeSocialActivity(activityId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] }),
  });
}

export function useCreateSocialComment(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: string | null }) =>
      createSocialComment(activityId, content, parentCommentId),
    onSuccess: (_comment, variables) => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'comments', activityId, variables.parentCommentId ?? 'root'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] });
    },
  });
}

export function useDeleteSocialComment(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSocialComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'comments', activityId] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] });
    },
  });
}

export function useToggleSocialCommentLike(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) =>
      isLiked ? unlikeSocialComment(commentId) : likeSocialComment(commentId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'comments', activityId] }),
  });
}

export function useReportSocialContent() {
  return useMutation({
    mutationFn: reportSocialContent,
  });
}

export function useMarkSocialNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markSocialNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications', 'unread-count'] });
    },
  });
}

export function useMarkAllSocialNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllSocialNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications'] });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications', 'unread-count'] });
    },
  });
}

export function useUnblockSocialUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unblockSocialUser(userId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'blocked-users'] }),
  });
}
