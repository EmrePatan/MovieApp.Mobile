import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { AppText } from '@/components/common/AppText';
import { resolveImageUri } from '@/utils/image-url';
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

export type SocialCommentPosterFrameSize = 'thread' | 'feed' | 'preview' | 'quote' | 'rail';

interface SocialCommentPosterFrameProps {
  path: string;
  size?: SocialCommentPosterFrameSize;
  accessibilityLabel?: string;
}

function PhotoBadge() {
  return (
    <View style={styles.badge} pointerEvents="none">
      <AppText variant="caption" style={styles.badgeText}>
        PHOTO
      </AppText>
    </View>
  );
}

export function SocialCommentPosterFrame({
  path,
  size = 'thread',
  accessibilityLabel,
}: SocialCommentPosterFrameProps) {
  const [aspect, setAspect] = useState(THREAD_MEDIA_FALLBACK_ASPECT);
  const [feedAspect, setFeedAspect] = useState(SOCIAL_FEED_MEDIA_ASPECT.fallback);
  const uri = resolveImageUri(path);

  if (size === 'feed') {
    return (
      <View style={[styles.frame, styles.feed, { aspectRatio: feedAspect }]}>
        {uri ? (
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel={accessibilityLabel}
            onLoad={(event) => {
              const width = event.source?.width;
              const height = event.source?.height;
              if (width && height && width > 0 && height > 0) {
                setFeedAspect(clampSocialFeedMediaAspect(width / height));
              }
            }}
          />
        ) : (
          <View style={styles.feedFallback} accessibilityLabel={accessibilityLabel} accessibilityRole="image">
            <Ionicons name="image-outline" size={28} color={socialFeedTheme.textMuted} />
          </View>
        )}
      </View>
    );
  }

  if (size === 'thread') {
    const frame = resolveThreadMediaFrame(aspect);
    return (
      <View style={[styles.frame, { width: frame.width, height: frame.height }]}>
        {uri ? (
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            accessibilityLabel={accessibilityLabel}
            onLoad={(event) => {
              const width = event.source?.width;
              const height = event.source?.height;
              if (width && height && width > 0 && height > 0) {
                setAspect(width / height);
              }
            }}
          />
        ) : null}
      </View>
    );
  }

  const dims =
    size === 'preview'
      ? { width: 112, height: 168 }
      : size === 'quote'
        ? { width: 120, height: 72 }
        : { width: 56, height: 32 };

  const showBadge = size === 'preview';

  return (
    <View style={styles.frame}>
      <CatalogImage
        path={path}
        width={dims.width}
        height={dims.height}
        accessibilityLabel={accessibilityLabel}
      />
      {showBadge ? <PhotoBadge /> : null}
    </View>
  );
}

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
  feedFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(8,8,10,0.78)',
  },
  badgeText: {
    color: socialFeedTheme.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontSize: 10,
  },
});
