import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { AppText } from '@/components/common/AppText';
import { useMovieVideos, useTvShowVideos } from '../hooks/useVideos';
import { isValidTrailerWatchUrl } from '../utils/validate-trailer-watch-url';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface PlayTrailerButtonProps {
  contentType: 'movie' | 'tv';
  contentId: string;
}

export function PlayTrailerButton({ contentType, contentId }: PlayTrailerButtonProps) {
  const movieQuery = useMovieVideos(contentType === 'movie' ? contentId : '');
  const tvQuery = useTvShowVideos(contentType === 'tv' ? contentId : '');
  const query = contentType === 'movie' ? movieQuery : tvQuery;

  const handlePress = useCallback(async () => {
    const watchUrl = query.data?.primary?.watchUrl;
    if (!watchUrl || !isValidTrailerWatchUrl(watchUrl)) {
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(watchUrl);
      if (!canOpen) {
        Alert.alert('Unable to open trailer', 'Please try again later.');
        return;
      }

      await Linking.openURL(watchUrl);
    } catch {
      Alert.alert('Unable to open trailer', 'Please try again later.');
    }
  }, [query.data?.primary?.watchUrl]);

  const watchUrl = query.data?.primary?.watchUrl;

  if (
    query.isLoading
    || query.isError
    || !watchUrl
    || !isValidTrailerWatchUrl(watchUrl)
  ) {
    return null;
  }

  return (
    <View style={styles.container} testID="play-trailer-button">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Play Trailer"
        onPress={handlePress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <View style={styles.iconBadge}>
          <Ionicons name="play" size={18} color={colors.background} style={styles.playIcon} />
        </View>
        <AppText variant="subtitle" style={styles.label}>
          Play Trailer
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  button: {
    minHeight: Math.max(52, interaction.touchTarget),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint14,
  },
  buttonPressed: {
    opacity: interaction.pressedOpacity,
    backgroundColor: colors.accentTint18,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  playIcon: {
    marginLeft: 2,
  },
  label: {
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
});
