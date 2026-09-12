import { StyleSheet, View } from 'react-native';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { RatingSection } from '@/features/ratings/components/RatingSection';
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import type { FavoriteContentType } from '@/features/favorites/types';
import { spacing } from '@/theme/spacing';

interface DetailActionsSectionProps {
  contentType: FavoriteContentType;
  contentId: string;
}

export function DetailActionsSection({ contentType, contentId }: DetailActionsSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <FavoriteButton contentType={contentType} contentId={contentId} />
        <AddToWatchlistButton contentType={contentType} contentId={contentId} />
        {contentType === 'movie' ? (
          <WatchedButton target={{ type: 'movie', contentId }} />
        ) : null}
      </View>
      <RatingSection contentType={contentType} contentId={contentId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
