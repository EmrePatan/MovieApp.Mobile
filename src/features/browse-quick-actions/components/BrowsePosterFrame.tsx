import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { PosterWatchedBadge } from './PosterWatchedBadge';

interface BrowsePosterFrameProps {
  watched: boolean;
  busy?: boolean;
  onToggleWatched?: () => void;
  children: ReactNode;
}

export function BrowsePosterFrame({
  watched,
  busy,
  onToggleWatched,
  children,
}: BrowsePosterFrameProps) {
  return (
    <View style={styles.frame}>
      {children}
      <PosterWatchedBadge watched={watched} busy={busy} onPress={onToggleWatched} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    alignSelf: 'flex-start',
    overflow: 'visible',
    zIndex: 1,
  },
});
