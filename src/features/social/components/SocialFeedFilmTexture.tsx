import { StyleSheet, View } from 'react-native';
import { socialFeedTheme } from './social-feed-theme';

/**
 * Extremely low-contrast vertical grain for the feed backdrop.
 * Pointer-events none — never steals taps or competes with posts.
 */
export function SocialFeedFilmTexture() {
  return (
    <View
      pointerEvents="none"
      style={styles.root}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.wash} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: socialFeedTheme.background,
    opacity: 1,
  },
});
