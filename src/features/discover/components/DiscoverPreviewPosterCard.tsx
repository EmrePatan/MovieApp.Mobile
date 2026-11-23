import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { BrowsePosterFrame } from '@/features/browse-quick-actions/components/BrowsePosterFrame';
import {
  buildBrowseQuickActionsTarget,
  useBrowsePosterQuickActions,
} from '@/features/browse-quick-actions/hooks/useBrowsePosterQuickActions';
import {
  isPersonSearchResult,
  type SearchResultItem,
} from '@/features/search/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { POSTER_CARD_ROLE } from '@/utils/poster-card-role';

interface DiscoverPreviewPosterCardProps {
  item: SearchResultItem;
  width: number;
  height: number;
  onPress: (item: SearchResultItem) => void;
}

export const DiscoverPreviewPosterCard = memo(function DiscoverPreviewPosterCard({
  item,
  width,
  height,
  onPress,
}: DiscoverPreviewPosterCardProps) {
  const { t } = useTranslation();
  const quickTarget = useMemo(() => {
    if (isPersonSearchResult(item)) {
      return null;
    }
    return buildBrowseQuickActionsTarget({
      contentId: item.id,
      contentType: item.type === 'tv' ? 'tv' : 'movie',
      title: item.title,
      posterUrl: item.posterUrl,
      year: item.year,
      releaseDate: item.releaseDate,
      voteAverage: item.voteAverage,
    });
  }, [item]);
  const { isWatched, watchedBusy, onLongPress, onToggleWatched } =
    useBrowsePosterQuickActions(quickTarget);

  return (
    <Pressable
      accessibilityRole={POSTER_CARD_ROLE}
      accessibilityLabel={item.title}
      onPress={() => onPress(item)}
      onLongPress={onLongPress}
      delayLongPress={380}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <BrowsePosterFrame
        watched={isWatched}
        busy={watchedBusy}
        onToggleWatched={onToggleWatched}
      >
        <PosterImage
          uri={item.posterUrl}
          width={width}
          height={height}
          accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
        />
      </BrowsePosterFrame>
      <AppText variant="caption" numberOfLines={2} style={styles.cardTitle}>
        {item.title}
      </AppText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
