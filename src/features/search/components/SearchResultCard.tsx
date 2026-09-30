import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { CatalogResultRow } from '@/features/catalog/components/CatalogResultRow';
import {
  isPersonSearchResult,
  type CatalogSearchResultItem,
  type PersonSearchResultItem,
  type SearchResultItem,
} from '../types';
import { formatContentType, formatKnownForDepartment } from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SearchResultCardProps {
  item: SearchResultItem;
  onPress?: (item: SearchResultItem) => void;
}

const PERSON_PORTRAIT_SIZE = layout.posterList.width;

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
      style={({ pressed }) => [styles.personCard, pressed && styles.pressed]}
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
            <Ionicons name="person-outline" size={22} color={colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.personMeta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.personTitle}>
          {item.title}
        </AppText>
        {metadataLine ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {metadataLine}
          </AppText>
        ) : null}
        {item.overview ? (
          <AppText variant="caption" muted numberOfLines={2}>
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
  const mediaType = item.type === 'tv' ? 'tv' : 'movie';

  return (
    <CatalogResultRow
      title={item.title}
      posterUrl={item.posterUrl}
      mediaType={mediaType}
      releaseDate={item.releaseDate}
      year={item.year}
      voteAverage={item.voteAverage}
      onPress={() => onPress?.(item)}
    />
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
  personCard: {
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
  personMeta: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
    minHeight: PERSON_PORTRAIT_SIZE,
    justifyContent: 'center',
  },
  personTitle: {
    color: colors.textPrimary,
  },
});
