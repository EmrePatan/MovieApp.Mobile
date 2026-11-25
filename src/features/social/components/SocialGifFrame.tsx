import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/common/AppText';
import {
  resolveThreadMediaFrame,
  THREAD_MEDIA_FALLBACK_ASPECT,
} from '../utils/resolve-thread-media-frame';
import { borderRadius } from '@/theme/spacing';
import {
  clampSocialFeedMediaAspect,
  SOCIAL_FEED_MEDIA_ASPECT,
  socialFeedTheme,
} from './social-feed-theme';

export type SocialGifFrameSize = 'thread' | 'feed' | 'quote' | 'preview' | 'rail';

interface SocialGifFrameProps {
  uri: string;
  size?: SocialGifFrameSize;
  /** When false, hide the GIF chip (static photo). Default true for GIF frames. */
  showGifBadge?: boolean;
}

const FIXED: Record<Exclude<SocialGifFrameSize, 'feed' | 'thread'>, { width: number; height: number }> = {
  quote: { width: 148, height: 96 },
  preview: { width: 168, height: 112 },
  rail: { width: 56, height: 32 },
};

function GifBadge() {
  return (
    <View style={styles.badgeTopRight} pointerEvents="none">
      <AppText variant="caption" style={styles.badgeText}>
        GIF
      </AppText>
    </View>
  );
}

export function SocialGifFrame({
  uri,
  size = 'thread',
  showGifBadge = true,
}: SocialGifFrameProps) {
  const [aspect, setAspect] = useState(THREAD_MEDIA_FALLBACK_ASPECT);
  const [feedAspect, setFeedAspect] = useState(SOCIAL_FEED_MEDIA_ASPECT.fallback);

  if (size === 'feed') {
    return (
      <View style={[styles.frame, styles.feed, { aspectRatio: feedAspect }]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel={showGifBadge ? 'GIF' : 'Image'}
          onLoad={(event) => {
            const width = event.source?.width;
            const height = event.source?.height;
            if (width && height && width > 0 && height > 0) {
              setFeedAspect(clampSocialFeedMediaAspect(width / height));
            }
          }}
        />
        {showGifBadge ? <GifBadge /> : null}
      </View>
    );
  }

  if (size === 'thread') {
    const frame = resolveThreadMediaFrame(aspect);
    return (
      <View style={[styles.frame, { width: frame.width, height: frame.height }]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          accessibilityLabel={showGifBadge ? 'GIF' : 'Image'}
          onLoad={(event) => {
            const width = event.source?.width;
            const height = event.source?.height;
            if (width && height && width > 0 && height > 0) {
              setAspect(width / height);
            }
          }}
        />
        {showGifBadge ? <GifBadge /> : null}
      </View>
    );
  }

  const fixed = FIXED[size];
  const showBadge = showGifBadge && size !== 'rail';
  return (
    <View style={[styles.frame, { width: fixed.width, height: fixed.height }]}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        accessibilityLabel={showGifBadge ? 'GIF' : 'Image'}
      />
      {showBadge ? <GifBadge /> : null}
    </View>
  );
}

const badgeShell = {
  position: 'absolute' as const,
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: borderRadius.sm,
  backgroundColor: 'rgba(8,8,10,0.78)',
};

const styles = StyleSheet.create({
  frame: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: socialFeedTheme.mediaBackdrop,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  feed: {
    width: '100%',
    alignSelf: 'stretch',
  },
  badgeTopRight: {
    ...badgeShell,
    top: 8,
    right: 8,
    zIndex: 1,
  },
  badgeText: {
    color: socialFeedTheme.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontSize: 10,
  },
});
