import { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { AppButton } from '@/components/buttons/AppButton';
import { useMovieVideos, useTvShowVideos } from '../hooks/useVideos';
import { isValidTrailerWatchUrl } from '../utils/validate-trailer-watch-url';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

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
      <AppButton title="Play Trailer" variant="secondary" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.sm,
  },
});
