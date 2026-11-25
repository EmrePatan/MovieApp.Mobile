import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { parseSocialCommentContent } from '../utils/social-comment-media';
import { SpoilerGate } from '@/features/reviews/components/SpoilerGate';
import { SocialGifFrame } from './SocialGifFrame';
import { SocialCommentPosterFrame } from './SocialCommentPosterFrame';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type SocialCommentContentDensity = 'feed' | 'thread' | 'quote';

interface SocialCommentContentProps {
  content: string;
  onDark?: boolean;
  /** @deprecated use density="quote" */
  compactGif?: boolean;
  density?: SocialCommentContentDensity;
}

export function SocialCommentContent({
  content,
  onDark = false,
  compactGif = false,
  density: densityProp,
}: SocialCommentContentProps) {
  const density: SocialCommentContentDensity = densityProp ?? (compactGif ? 'quote' : 'thread');
  const parsed = parseSocialCommentContent(content);
  const textStyle = onDark ? styles.textOnDark : undefined;
  const textVariant = density === 'quote' ? 'caption' : density === 'feed' ? 'body' : 'bodySmall';

  return (
    <SpoilerGate spoiler={parsed.spoiler}>
      <View style={[styles.wrap, styles[`wrap_${density}`]]}>
        {parsed.text ? (
          <AppText variant={textVariant} style={textStyle}>
            {parsed.text}
          </AppText>
        ) : null}
        {parsed.gifUrl ? (
          <SocialGifFrame uri={parsed.gifUrl} size={density === 'feed' ? 'feed' : density} />
        ) : null}
        {parsed.posterPath ? (
          <SocialCommentPosterFrame path={parsed.posterPath} size="thread" />
        ) : null}
      </View>
    </SpoilerGate>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  wrap_feed: {
    gap: 4,
  },
  wrap_thread: {
    gap: spacing.xs,
  },
  wrap_quote: {
    gap: 2,
  },
  textOnDark: {
    color: colors.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});