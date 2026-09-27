import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BackdropImage } from './CatalogImage';
import { DetailBackButton } from './DetailBackButton';
import { DetailScrim } from './DetailScrim';
import { DetailHeroTrailerLayer } from '@/features/details/videos/components/DetailHeroTrailerLayer';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

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

  return (
    <View style={[styles.mediaContainer, { height: heroHeight }]}>
      <BackdropImage path={heroImagePath} height={heroHeight} />
      {!trailer || !isTrailerPlaying ? <DetailScrim /> : null}
      {trailer ? (
        <DetailHeroTrailerLayer
          contentType={trailer.contentType}
          contentId={trailer.contentId}
          topOffset={topOffset}
          onPlayingChange={setIsTrailerPlaying}
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
});
