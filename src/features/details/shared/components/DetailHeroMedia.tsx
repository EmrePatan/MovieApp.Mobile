import { useCallback, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';
import { BackdropImage } from './CatalogImage';
import { DetailBackButton } from './DetailBackButton';
import { DetailScrim } from './DetailScrim';
import { DetailHeroTrailerLayer } from '@/features/details/videos/components/DetailHeroTrailerLayer';
import { colors } from '@/theme/colors';
import { shadows } from '@/theme/shadows';

const TRAILER_PLAYBACK_HEIGHT_BOOST = 56;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DetailHeroMediaProps {
  heroImagePath: string | null | undefined;
  heroHeight: number;
  topOffset: number;
  trailer?: {
    contentType: 'movie' | 'tv';
    contentId: string;
  };
}

export function DetailHeroMedia({
  heroImagePath,
  heroHeight,
  topOffset,
  trailer,
}: DetailHeroMediaProps) {
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);

  const handlePlayingChange = useCallback((playing: boolean) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        260,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
    setIsTrailerPlaying(playing);
  }, []);

  const mediaHeight = heroHeight + (isTrailerPlaying ? TRAILER_PLAYBACK_HEIGHT_BOOST : 0);

  return (
    <View
      style={[
        styles.mediaContainer,
        { height: mediaHeight, transform: [{ translateY: isTrailerPlaying ? -10 : 0 }] },
        isTrailerPlaying && styles.mediaContainerPlaying,
      ]}
    >
      <BackdropImage path={heroImagePath} height={mediaHeight} />
      {!trailer || !isTrailerPlaying ? <DetailScrim /> : null}
      {trailer ? (
        <DetailHeroTrailerLayer
          contentType={trailer.contentType}
          contentId={trailer.contentId}
          topOffset={topOffset}
          onPlayingChange={handlePlayingChange}
        />
      ) : null}
      <DetailBackButton variant="overlay" topOffset={topOffset} />
    </View>
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  mediaContainerPlaying: {
    zIndex: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAccent,
    ...shadows.card,
  },
});
