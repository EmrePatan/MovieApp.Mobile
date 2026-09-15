import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';

interface HomeBrandMarkProps {
  overlay?: boolean;
}

export function HomeBrandMark({ overlay = false }: HomeBrandMarkProps) {
  const variant = overlay ? 'bodySmall' : 'title';

  return (
    <View style={styles.container} accessibilityRole="header">
      <AppText variant={variant} style={[styles.movie, overlay && styles.movieOverlay]}>
        Movie
      </AppText>
      <AppText variant={variant} style={[styles.app, overlay && styles.appOverlay]}>
        App
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  movie: {
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  movieOverlay: {
    color: 'rgba(245, 245, 247, 0.88)',
  },
  app: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  appOverlay: {
    color: colors.accentStrong,
  },
});
