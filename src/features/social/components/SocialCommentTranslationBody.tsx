import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ContentTranslationControls } from '@/features/reviews/components/ContentTranslationControls';
import { parseSocialCommentContent } from '../utils/social-comment-media';
import { useSocialCommentTranslation } from '../hooks/useSocialCommentTranslation';
import type { SocialComment } from '../types';
import type { SocialCommentContentDensity } from './SocialCommentContent';
import { SocialGifFrame } from './SocialGifFrame';
import { SocialCommentPosterFrame } from './SocialCommentPosterFrame';
import { shouldShowReviewTranslationAction } from '@/features/reviews/utils/review-locale';
import { getUiFormatLocaleTag } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';
import { socialFeedSpacing } from './social-ui-tokens';

interface SocialCommentTranslationBodyProps {
  comment: SocialComment;
  density?: SocialCommentContentDensity;
}

function densityToVariant(density: SocialCommentContentDensity): 'body' | 'bodySmall' | 'caption' {
  if (density === 'feed') return 'body';
  if (density === 'quote') return 'caption';
  return 'bodySmall';
}

export function SocialCommentTranslationBody({
  comment,
  density = 'thread',
}: SocialCommentTranslationBodyProps) {
  const parsed = parseSocialCommentContent(comment.content);
  const textVariant = densityToVariant(density);
  const [requestTranslation, setRequestTranslation] = useState(false);
  const currentLocale = getUiFormatLocaleTag();
  const mediaSize = density === 'feed' ? 'feed' : density === 'quote' ? 'quote' : 'thread';

  const shouldShowAction = useMemo(
    () => shouldShowReviewTranslationAction(comment.authoringLocale, currentLocale),
    [comment.authoringLocale, currentLocale],
  );

  const translationQuery = useSocialCommentTranslation(comment, requestTranslation && shouldShowAction);

  const media = parsed.gifUrl ? (
    <SocialGifFrame uri={parsed.gifUrl} size={mediaSize} />
  ) : parsed.posterPath ? (
    <SocialCommentPosterFrame path={parsed.posterPath} size={density === 'feed' ? 'feed' : 'thread'} />
  ) : null;

  if (!parsed.text.trim()) {
    return media ? <View style={styles.mediaOnly}>{media}</View> : null;
  }

  return (
    <View
      style={[
        styles.wrap,
        density === 'feed' && styles.wrapFeed,
        density === 'thread' && styles.wrapThread,
      ]}
    >
      <ContentTranslationControls
        content={parsed.text}
        authoringLocale={comment.authoringLocale}
        textVariant={textVariant}
        contentStyle={
          density === 'feed'
            ? styles.feedQuote
            : density === 'thread'
              ? styles.threadQuote
              : undefined
        }
        numberOfLines={density === 'feed' ? 5 : undefined}
        translationQuery={translationQuery}
        fetchTranslation={() => setRequestTranslation(true)}
      />
      {media}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: socialFeedSpacing.blockGap },
  wrapFeed: {
    gap: spacing.sm,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  wrapThread: {
    gap: spacing.sm,
    maxWidth: '100%',
  },
  mediaOnly: {
    maxWidth: '100%',
  },
  feedQuote: {
    fontSize: 15,
    lineHeight: 22,
    color: socialFeedTheme.textPrimary,
  },
  threadQuote: {
    fontSize: 15,
    lineHeight: 22,
    color: socialFeedTheme.textPrimary,
  },
});

