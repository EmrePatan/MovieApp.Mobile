import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  acceptSocialFollowRequest,
  blockSocialUser,
  followSocialUser,
  likeSocialActivity,
  unlikeSocialActivity,
  likeSocialComment,
  unlikeSocialComment,
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

export function useSocialActivityLike(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isLiked: boolean) =>
      isLiked ? unlikeSocialActivity(activityId) : likeSocialActivity(activityId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'feed'] }),
  });
}

export function useSocialCommentLike(commentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isLiked: boolean) =>
      isLiked ? unlikeSocialComment(commentId) : likeSocialComment(commentId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all }),
  });
}
