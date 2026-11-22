import { StyleSheet, View } from 'react-native';
import { PosterImage } from '@/components/common/PosterImage';
import { borderRadius } from '@/theme/spacing';

export const WATCHLIST_COVER_WIDTH = 48;
export const WATCHLIST_COVER_HEIGHT = 64;
const GAP = 2;

interface WatchlistCoverCollageProps {
  /** Newest-first poster paths. Renders nothing when empty so the caller can show a fallback. */
  posterPaths: readonly string[];
}

/**
 * List cover built from the newest titles' posters:
 * one poster fills the cover, two sit side by side, three or four form a 2x2 grid.
 */
export function WatchlistCoverCollage({ posterPaths }: WatchlistCoverCollageProps) {
  const paths = posterPaths.slice(0, 4);

  if (paths.length === 0) {
    return null;
  }

  if (paths.length === 1) {
    return (
      <View style={styles.cover} testID="watchlist-cover-collage">
        <PosterImage uri={paths[0]} width={WATCHLIST_COVER_WIDTH} height={WATCHLIST_COVER_HEIGHT} />
      </View>
    );
  }

  if (paths.length === 2) {
    const tileWidth = (WATCHLIST_COVER_WIDTH - GAP) / 2;
    return (
      <View style={[styles.cover, styles.row]} testID="watchlist-cover-collage">
        {paths.map((path, index) => (
          <PosterImage
            key={`${index}-${path}`}
            uri={path}
            width={tileWidth}
            height={WATCHLIST_COVER_HEIGHT}
          />
        ))}
      </View>
    );
  }

  const tileWidth = (WATCHLIST_COVER_WIDTH - GAP) / 2;
  const tileHeight = (WATCHLIST_COVER_HEIGHT - GAP) / 2;
  return (
    <View style={[styles.cover, styles.grid]} testID="watchlist-cover-collage">
      {paths.map((path, index) => (
        <PosterImage
          key={`${index}-${path}`}
          uri={path}
          width={tileWidth}
          height={tileHeight}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: WATCHLIST_COVER_WIDTH,
    height: WATCHLIST_COVER_HEIGHT,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
  },
});
