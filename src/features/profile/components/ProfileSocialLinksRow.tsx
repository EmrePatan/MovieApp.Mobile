import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import type { ProfileSocialLinks } from '../types';
import { filledSocialLinks } from '../utils/profile-social-links';
import { ProfileSocialPlatformIcon } from './ProfileSocialPlatformIcon';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

interface ProfileSocialLinksRowProps {
  links: ProfileSocialLinks | null | undefined;
  color?: string;
}

export function ProfileSocialLinksRow({
  links,
  color = colors.textPrimary,
}: ProfileSocialLinksRowProps) {
  const { t } = useTranslation();
  const filled = filledSocialLinks(links);
  if (filled.length === 0) return null;

  return (
    <View style={styles.row} accessibilityRole="list">
      {filled.map(({ platform, url, value }) => {
        const labelKey = `profile.socialPlatform${platform.charAt(0).toUpperCase()}${platform.slice(1)}` as const;
        const label = t(labelKey, { defaultValue: platform });
        return (
          <Pressable
            key={platform}
            accessibilityRole="link"
            accessibilityLabel={`${label}: ${value}`}
            hitSlop={4}
            onPress={() => {
              void Linking.openURL(url);
            }}
            style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
          >
            <ProfileSocialPlatformIcon platform={platform} size={16} color={color} />
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Social icons that fill whatever room is left beside the counts, right-aligned.
 * When a member has more links than fit, the rail scrolls sideways.
 */
/** `fullWidth`: own line, icons start at the left edge (default: fills leftover room, right-aligned). */
export function ProfileSocialLinksRail({
  links,
  fullWidth = false,
}: ProfileSocialLinksRowProps & { fullWidth?: boolean }) {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  if (filledSocialLinks(links).length === 0) return null;
  // A half-cut icon is the only hint the rail scrolls; a fade on the cut edge says it outright.
  const overflowing = contentWidth > viewportWidth + 1 && viewportWidth > 0;
  return (
    <View style={fullWidth ? styles.railWrapFull : styles.railWrap} onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rail}
        contentContainerStyle={[styles.railContent, fullWidth && styles.railContentStart]}
        onContentSizeChange={(width) => setContentWidth(width)}
        scrollEventThrottle={32}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          setScrolledToEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 4);
        }}
      >
        <ProfileSocialLinksRow links={links} />
      </ScrollView>
      {overflowing && !scrolledToEnd ? (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(10,10,15,0)', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.railFade}
          testID="social-links-fade"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  railWrap: {
    flex: 1,
    minWidth: 0,
  },
  railWrapFull: {
    alignSelf: 'stretch',
  },
  railContentStart: {
    justifyContent: 'flex-start',
  },
  railFade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 28,
  },
  rail: {
    flexGrow: 0,
  },
  railContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconHit: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.panelElevated,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  pressed: {
    opacity: 0.65,
  },
});
