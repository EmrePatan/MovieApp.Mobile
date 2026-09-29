import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { RecentSearchStoredItem } from '../recent-searches/recent-search-types';
import { formatContentType } from '@/utils/format';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const ENTITY_THUMB_WIDTH = 36;
const ENTITY_THUMB_HEIGHT = 54;
const PERSON_THUMB_SIZE = 36;

interface SearchHistorySectionProps {
  items: RecentSearchStoredItem[];
  isClearing: boolean;
  deletingId: string | null;
  onSelectQuery: (query: string) => void;
  onSelectEntity: (item: Extract<RecentSearchStoredItem, { kind: 'entity' }>) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

function formatEntityMetadata(
  item: Extract<RecentSearchStoredItem, { kind: 'entity' }>,
): string {
  if (item.entityType === 'person') {
    return formatContentType('person');
  }

  return formatContentType(item.entityType);
}

export const SearchHistorySection = memo(function SearchHistorySection({
  items,
  isClearing,
  deletingId,
  onSelectQuery,
  onSelectEntity,
  onDelete,
  onClearAll,
}: SearchHistorySectionProps) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="subtitle" style={styles.title}>{t('search.history.recentSearches')}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.clearAllSearchHistory')}
          disabled={isClearing}
          onPress={onClearAll}
          hitSlop={8}
        >
          <AppText variant="caption" style={styles.clearAll}>
            {t('search.history.clearAll')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => (
          <View
            key={item.id}
            style={[styles.row, index < items.length - 1 && styles.rowBorder]}
          >
            {item.kind === 'query' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('search.history.searchFor', { query: item.query })}
                onPress={() => onSelectQuery(item.query)}
                style={({ pressed }) => [styles.historyButton, pressed && styles.pressed]}
              >
                <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                <View style={styles.historyMeta}>
                  <AppText variant="bodySmall" numberOfLines={1}>
                    {item.query}
                  </AppText>
                </View>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('search.history.openEntity', {
                  title: item.title,
                  type: formatEntityMetadata(item),
                })}
                onPress={() => onSelectEntity(item)}
                style={({ pressed }) => [styles.historyButton, pressed && styles.pressed]}
              >
                {item.entityType === 'person' ? (
                  item.posterUrl ? (
                    <CatalogImage
                      path={item.posterUrl}
                      width={PERSON_THUMB_SIZE}
                      height={PERSON_THUMB_SIZE}
                      rounded
                      accessibilityLabel={t('details.sections.personPortrait', { name: item.title })}
                    />
                  ) : (
                    <View style={styles.personLeadingIcon}>
                      <Ionicons name="person-outline" size={18} color={colors.textMuted} />
                    </View>
                  )
                ) : item.posterUrl ? (
                  <PosterImage
                    uri={item.posterUrl}
                    width={ENTITY_THUMB_WIDTH}
                    height={ENTITY_THUMB_HEIGHT}
                    accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
                  />
                ) : (
                  <View style={styles.leadingIcon}>
                    <Ionicons
                      name={item.entityType === 'tv' ? 'tv-outline' : 'film-outline'}
                      size={18}
                      color={colors.textMuted}
                    />
                  </View>
                )}
                <View style={styles.historyMeta}>
                  <AppText variant="bodySmall" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" muted numberOfLines={1}>
                    {formatEntityMetadata(item)}
                  </AppText>
                </View>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                item.kind === 'query'
                  ? t('search.history.deleteItem', { query: item.query })
                  : t('search.history.deleteEntity', { title: item.title })
              }
              disabled={deletingId === item.id}
              onPress={() => onDelete(item.id)}
              hitSlop={8}
              style={styles.deleteButton}
            >
              {deletingId === item.id ? (
                <ActivityIndicator color={colors.textMuted} size="small" />
              ) : (
                <Ionicons name="close" size={16} color={colors.textMuted} />
              )}
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    letterSpacing: 0.15,
  },
  clearAll: {
    color: colors.accent,
    fontWeight: '600',
  },
  list: {
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  historyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  historyMeta: {
    flex: 1,
    gap: 2,
  },
  leadingIcon: {
    width: ENTITY_THUMB_WIDTH,
    height: ENTITY_THUMB_HEIGHT,
    borderRadius: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  personLeadingIcon: {
    width: PERSON_THUMB_SIZE,
    height: PERSON_THUMB_SIZE,
    borderRadius: PERSON_THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  deleteButton: {
    minWidth: 40,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
  },
});
