import { useCallback } from 'react';
import { Alert, Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { AppText } from '@/components/common/AppText';
import { useMovieVideos, useTvShowVideos } from '../hooks/useVideos';
import { isValidTrailerWatchUrl } from '../utils/validate-trailer-watch-url';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
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
      if (Platform.OS === 'ios') {
        const canOpen = await Linking.canOpenURL(watchUrl);
        if (!canOpen) {
          Alert.alert('Unable to open trailer', 'Please try again later.');
          return;
        }
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
    <Pressable
      testID="play-trailer-button"
      accessibilityRole="button"
      accessibilityLabel="Play Trailer"
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Ionicons name="play" size={14} color={colors.accent} style={styles.playIcon} />
      <AppText variant="bodySmall" style={styles.label}>
        Trailer
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    minHeight: interaction.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  buttonPressed: {
    opacity: interaction.subtlePressedOpacity,
    backgroundColor: colors.inputBackground,
  },
  playIcon: {
    marginLeft: 1,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
});
