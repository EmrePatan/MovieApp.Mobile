import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import type { SearchHistoryItem } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface SearchHistorySectionProps {
  items: SearchHistoryItem[];
  isLoading: boolean;
  isError: boolean;
  isClearing: boolean;
  deletingId: string | null;
  onSelect: (query: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onRetry: () => void;
}

function formatSearchedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export const SearchHistorySection = memo(function SearchHistorySection({
  items,
  isLoading,
  isError,
  isClearing,
  deletingId,
  onSelect,
  onDelete,
  onClearAll,
  onRetry,
}: SearchHistorySectionProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="small" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.section}>
        <AppText variant="bodySmall" muted>
          {t('search.history.loadError')}
        </AppText>
        <AppButton title={t('search.history.retry')} variant="ghost" onPress={onRetry} />
      </View>
    );
  }

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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('search.history.searchFor', { query: item.query })}
              onPress={() => onSelect(item.query)}
              style={({ pressed }) => [styles.historyButton, pressed && styles.pressed]}
            >
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <View style={styles.historyMeta}>
                <AppText variant="bodySmall" numberOfLines={1}>
                  {item.query}
                </AppText>
                <AppText variant="caption" muted>
                  {formatSearchedAt(item.searchedAt)}
                </AppText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('search.history.deleteItem', { query: item.query })}
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
  loading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
