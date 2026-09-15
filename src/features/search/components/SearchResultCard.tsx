import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import {
  isPersonSearchResult,
  type CatalogSearchResultItem,
  type PersonSearchResultItem,
  type SearchResultItem,
} from '../types';
import {
  formatCatalogYear,
  formatContentType,
  formatKnownForDepartment,
  formatRating,
} from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SearchResultCardProps {
  item: SearchResultItem;
  onPress?: (item: SearchResultItem) => void;
}

const PERSON_PORTRAIT_SIZE = layout.posterList.height;

const PersonSearchResultCard = memo(function PersonSearchResultCard({
  item,
  onPress,
}: {
  item: PersonSearchResultItem;
  onPress?: (item: SearchResultItem) => void;
}) {
  const department = formatKnownForDepartment(item.knownForDepartment);
  const metadataLine = [formatContentType('person'), department].filter(Boolean).join(' · ');
  const accessibilityLabel = `${item.title}, ${metadataLine || formatContentType('person')}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.portrait,
          {
            width: PERSON_PORTRAIT_SIZE,
            height: PERSON_PORTRAIT_SIZE,
            borderRadius: PERSON_PORTRAIT_SIZE / 2,
          },
        ]}
      >
        {item.posterUrl ? (
          <CatalogImage
            path={item.posterUrl}
            width={PERSON_PORTRAIT_SIZE}
            height={PERSON_PORTRAIT_SIZE}
            rounded
            accessibilityLabel={`${item.title} portrait`}
          />
        ) : (
          <View
            style={[
              styles.portraitFallback,
              {
                width: PERSON_PORTRAIT_SIZE,
                height: PERSON_PORTRAIT_SIZE,
                borderRadius: PERSON_PORTRAIT_SIZE / 2,
              },
            ]}
          >
            <Ionicons name="person-outline" size={28} color={colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        {metadataLine ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.metadata}>
            {metadataLine}
          </AppText>
        ) : null}
        {item.overview ? (
          <AppText variant="caption" muted numberOfLines={2} style={styles.overview}>
            {item.overview}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const CatalogSearchResultCard = memo(function CatalogSearchResultCard({
  item,
  onPress,
}: {
  item: CatalogSearchResultItem;
  onPress?: (item: SearchResultItem) => void;
}) {
  const year = formatCatalogYear(item.releaseDate, item.year);

  const metadataLine = useMemo(() => {
    const parts = [
      formatContentType(item.type),
      year,
      item.voteAverage > 0 ? `★ ${formatRating(item.voteAverage)}` : null,
    ].filter(Boolean);

    return parts.join(' · ');
  }, [item.type, item.voteAverage, year]);

  const accessibilityLabel = `${item.title}, ${metadataLine || formatContentType(item.type)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <PosterImage
        uri={item.posterUrl}
        width={layout.posterList.width}
        height={layout.posterList.height}
        accessibilityLabel={`${item.title} poster`}
      />
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        {metadataLine ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.metadata}>
            {metadataLine}
          </AppText>
        ) : null}
        {item.overview ? (
          <AppText variant="caption" muted numberOfLines={2} style={styles.overview}>
            {item.overview}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

export const SearchResultCard = memo(function SearchResultCard({
  item,
  onPress,
}: SearchResultCardProps) {
  if (isPersonSearchResult(item)) {
    return <PersonSearchResultCard item={item} onPress={onPress} />;
  }

  return <CatalogSearchResultCard item={item} onPress={onPress} />;
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
    backgroundColor: colors.surface,
  },
  portrait: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  portraitFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
    minHeight: layout.posterList.height - spacing.xs,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
  },
  metadata: {
    letterSpacing: 0.1,
  },
  overview: {
    lineHeight: 16,
  },
});
