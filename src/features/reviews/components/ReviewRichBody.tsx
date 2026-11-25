import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ContentTranslationControls } from './ContentTranslationControls';
import { SpoilerGate } from './SpoilerGate';
import { parseSocialCommentContent } from '@/features/social/utils/social-comment-media';
import {
  SocialGifFrame,
  type SocialGifFrameSize,
} from '@/features/social/components/SocialGifFrame';
import { SocialCommentPosterFrame } from '@/features/social/components/SocialCommentPosterFrame';
import { useReviewTranslation } from '../hooks/useReviewTranslation';
import { shouldShowReviewTranslationAction } from '../utils/review-locale';
import { getUiFormatLocaleTag } from '@/i18n';
import type { ReviewResponse } from '../types';
import {
  DETAIL_REVIEW_PREVIEW_LINE_COUNT,
  DETAIL_REVIEW_PREVIEW_LINE_COUNT_WITH_MEDIA,
} from '../utils/detail-review-preview-layout';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

interface ReviewRichBodyProps {
  content: string;
  review?: ReviewResponse;
  numberOfLines?: number;
  textVariant?: 'body' | 'bodySmall' | 'caption';
  /** Skip translation UI (own review). */
  plain?: boolean;
  /** Show spoiler-flagged content without the warning (the viewer's own content). */
  revealSpoiler?: boolean;
  /** Detail rail preview: tiny GIF/photo thumb + clamped text. */
  compactMedia?: boolean;
  /** Override media frame size (defaults: rail when compact, otherwise feed). */
  mediaSize?: SocialGifFrameSize;
}

export function ReviewRichBody({
  content,
  review,
  numberOfLines,
  textVariant = 'bodySmall',
  plain = false,
  revealSpoiler = false,
  compactMedia = false,
  mediaSize,
}: ReviewRichBodyProps) {
  const parsed = useMemo(() => parseSocialCommentContent(content), [content]);
  const hasMedia = Boolean(parsed.gifUrl || parsed.posterPath);
  const resolvedMediaSize = mediaSize ?? (compactMedia ? 'rail' : 'feed');
  const resolvedLines = compactMedia
    ? hasMedia
      ? DETAIL_REVIEW_PREVIEW_LINE_COUNT_WITH_MEDIA
      : (numberOfLines ?? DETAIL_REVIEW_PREVIEW_LINE_COUNT)
    : numberOfLines;
  const skipTranslation = plain || compactMedia;
  const currentLocale = getUiFormatLocaleTag();
  const [requestTranslation, setRequestTranslation] = useState(false);
  const shouldShowAction = useMemo(
    () =>
      Boolean(review) &&
      !skipTranslation &&
      shouldShowReviewTranslationAction(review?.authoringLocale, currentLocale),
    [currentLocale, review, skipTranslation],
  );
  const translationReview =
    review ??
    ({
      id: '__none__',
      content: '',
      createdAt: '',
      updatedAt: null,
      user: { id: '', displayName: '', effectiveAvatarUrl: null },
    } as unknown as ReviewResponse);
  const translationQuery = useReviewTranslation(
    translationReview,
    Boolean(review) && requestTranslation && shouldShowAction,
  );

  const translationForText = useMemo(() => {
    if (!translationQuery.data) return translationQuery;
    const translatedText = parseSocialCommentContent(
      translationQuery.data.translatedText ?? '',
    ).text;
    return {
      ...translationQuery,
      data: {
        ...translationQuery.data,
        translatedText: translatedText || translationQuery.data.translatedText,
      },
    };
  }, [translationQuery]);

  const media = parsed.gifUrl ? (
    <SocialGifFrame uri={parsed.gifUrl} size={resolvedMediaSize} />
  ) : parsed.posterPath ? (
    <SocialCommentPosterFrame path={parsed.posterPath} size={resolvedMediaSize} />
  ) : null;

  // Own reviews stay readable; everyone else gets the spoiler warning first.
  const gated = parsed.spoiler && !revealSpoiler;

  if (!parsed.text.trim()) {
    return media ? (
      <SpoilerGate spoiler={gated}>
        <View style={[styles.wrap, compactMedia && styles.wrapCompact]}>{media}</View>
      </SpoilerGate>
    ) : null;
  }

  return (
    <SpoilerGate spoiler={gated}>
    <View style={[styles.wrap, compactMedia && styles.wrapCompact]}>
      {skipTranslation || !review ? (
        <AppText
          variant={textVariant}
          style={[styles.content, compactMedia && styles.contentCompact]}
          numberOfLines={resolvedLines}
        >
          {parsed.text}
        </AppText>
      ) : (
        <ContentTranslationControls
          content={parsed.text}
          authoringLocale={review.authoringLocale}
          textVariant={textVariant}
          numberOfLines={resolvedLines}
          translationQuery={translationForText as typeof translationQuery}
          fetchTranslation={() => setRequestTranslation(true)}
        />
      )}
      {media}
    </View>
    </SpoilerGate>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  wrapCompact: {
    flex: 1,
    minHeight: 0,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  content: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  contentCompact: {
    flexShrink: 1,
  },
});
