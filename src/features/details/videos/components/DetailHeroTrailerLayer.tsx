import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDetailTrailerWatchUrl } from '../hooks/useDetailTrailerWatchUrl';
import { extractYouTubeVideoIdFromWatchUrl } from '../utils/extract-youtube-video-id-from-watch-url';
import { isValidTrailerWatchUrl } from '../utils/validate-trailer-watch-url';
import { DetailTrailerPlayAffordance } from './DetailTrailerPlayAffordance';
import { InlineYoutubeTrailerPlayer } from './InlineYoutubeTrailerPlayer';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { borderRadius, spacing } from '@/theme/spacing';

interface DetailHeroTrailerLayerProps {
  contentType: 'movie' | 'tv';
  contentId: string;
  topOffset: number;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export function DetailHeroTrailerLayer({
  contentType,
  contentId,
  topOffset,
  onPlayingChange,
}: DetailHeroTrailerLayerProps) {
  const { t } = useTranslation();
  const { watchUrl } = useDetailTrailerWatchUrl({ contentType, contentId });
  const [isPlaying, setIsPlaying] = useState(false);

  const closeTrailer = useCallback(() => {
    setIsPlaying(false);
    onPlayingChange?.(false);
  }, [onPlayingChange]);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    onPlayingChange?.(true);
  }, [onPlayingChange]);

  const openTrailerExternally = useCallback(async () => {
    if (!watchUrl || !isValidTrailerWatchUrl(watchUrl)) {
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        const canOpen = await Linking.canOpenURL(watchUrl);
        if (!canOpen) {
          Alert.alert(t('details.actions.trailerOpenError'), t('details.actions.trailerOpenErrorMessage'));
          return;
        }
      }

      await Linking.openURL(watchUrl);
    } catch {
      Alert.alert(t('details.actions.trailerOpenError'), t('details.actions.trailerOpenErrorMessage'));
    }
  }, [t, watchUrl]);

  const handlePlaybackError = useCallback(() => {
    closeTrailer();
    void openTrailerExternally();
  }, [closeTrailer, openTrailerExternally]);

  const closeTrailerRef = useRef(closeTrailer);
  closeTrailerRef.current = closeTrailer;

  useFocusEffect(
    useCallback(() => {
      return () => {
        closeTrailerRef.current();
      };
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        closeTrailerRef.current();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const videoId = watchUrl ? extractYouTubeVideoIdFromWatchUrl(watchUrl) : null;

  if (!videoId) {
    return null;
  }

  return (
    <>
      {isPlaying ? (
        <InlineYoutubeTrailerPlayer
          videoId={videoId}
          onClose={closeTrailer}
          onPlaybackError={handlePlaybackError}
        />
      ) : (
        <DetailTrailerPlayAffordance onPress={startPlayback} />
      )}
      {isPlaying ? (
        <View pointerEvents="box-none" style={[styles.closeOverlay, { top: topOffset }]}>
          <Pressable
            testID="detail-trailer-close-button"
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={closeTrailer}
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          >
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  closeOverlay: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 12,
  },
  closeButton: {
    width: interaction.touchTarget,
    height: interaction.touchTarget,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  closeButtonPressed: {
    opacity: interaction.subtlePressedOpacity,
  },
});
