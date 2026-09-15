import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { FollowingCatalogItem } from '../types';
import { isFutureReleaseDate } from '@/utils/date';
import { formatCatalogYear, formatContentType, formatIsoDate } from '@/utils/format';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface FollowingListCardProps {
  item: FollowingCatalogItem;
  onPress?: (item: FollowingCatalogItem) => void;
}

export const FollowingListCard = memo(function FollowingListCard({
  item,
  onPress,
}: FollowingListCardProps) {
  const year = formatCatalogYear(item.releaseDate, item.year);
  const comingDate =
    item.type === 'movie' && isFutureReleaseDate(item.releaseDate)
      ? formatIsoDate(item.releaseDate)
      : null;
  const accessibilityLabel = `${item.title}, ${formatContentType(item.type)}${year ? `, ${year}` : ''}${comingDate ? `, coming ${comingDate}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <CatalogImage
        path={item.posterUrl}
        width={layout.posterList.width}
        height={layout.posterList.height}
        accessibilityLabel={`${item.title} poster`}
      />
      <View style={styles.meta}>
        <AppText variant="body" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        <View style={styles.row}>
          <ContentTypeBadge type={item.type} />
          {year ? (
            <AppText variant="caption" muted>
              {year}
            </AppText>
          ) : null}
        </View>
        {comingDate ? (
          <AppText variant="caption" muted numberOfLines={1}>
            Coming {comingDate}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    minHeight: layout.posterList.height + spacing.sm * 2,
  },
  pressed: {
    opacity: 0.85,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
