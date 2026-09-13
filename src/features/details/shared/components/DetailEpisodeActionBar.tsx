import { StyleSheet, View } from 'react-native';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import { spacing } from '@/theme/spacing';

interface DetailEpisodeActionBarProps {
  episodeId: string;
  tvShowId: string;
  seasonNumber: number;
}

export function DetailEpisodeActionBar({
  episodeId,
  tvShowId,
  seasonNumber,
}: DetailEpisodeActionBarProps) {
  return (
    <View style={styles.container}>
      <WatchedButton
        size={44}
        target={{
          type: 'episode',
          contentId: episodeId,
          tvShowId,
          seasonNumber,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
