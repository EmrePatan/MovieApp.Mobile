import { useQuery } from '@tanstack/react-query';
import { getUiFormatLocaleTag } from '@/i18n';
import { translateSocialComment } from '../api/social-api';
import type { SocialComment } from '../types';

export function socialCommentTranslationQueryKey(
  commentId: string,
  updatedAt: string | null | undefined,
) {
  const version = updatedAt ?? '';
  return ['social', 'comment-translation', commentId, version, getUiFormatLocaleTag()] as const;
}

export function useSocialCommentTranslation(comment: SocialComment, enabled: boolean) {
  const targetLocale = getUiFormatLocaleTag();

  return useQuery({
    queryKey: socialCommentTranslationQueryKey(comment.id, comment.updatedAt),
    queryFn: ({ signal }) => translateSocialComment(comment.id, signal),
    enabled,
    staleTime: Infinity,
    retry: false,
  });
}