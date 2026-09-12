import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import type { SearchHistoryItem } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

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

export function SearchHistorySection({
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
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.section}>
        <AppText variant="bodySmall" muted>
          Could not load recent searches.
        </AppText>
        <AppButton title="Retry" variant="ghost" onPress={onRetry} />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="subtitle">Recent Searches</AppText>
        {items.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear all search history"
            disabled={isClearing}
            onPress={onClearAll}
          >
            <AppText variant="bodySmall" style={styles.clearAll}>
              Clear all
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {items.length === 0 ? (
        <AppText variant="bodySmall" muted>
          Your recent searches will appear here.
        </AppText>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Search for ${item.query}`}
              onPress={() => onSelect(item.query)}
              style={({ pressed }) => [styles.historyButton, pressed && styles.pressed]}
            >
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <View style={styles.historyMeta}>
                <AppText variant="body">{item.query}</AppText>
                <AppText variant="caption" muted>
                  {formatSearchedAt(item.searchedAt)}
                </AppText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.query} from history`}
              disabled={deletingId === item.id}
              onPress={() => onDelete(item.id)}
              hitSlop={8}
            >
              {deletingId === item.id ? (
                <ActivityIndicator color={colors.textMuted} size="small" />
              ) : (
                <Ionicons name="close" size={18} color={colors.textMuted} />
              )}
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  clearAll: {
    color: colors.accent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingRight: spacing.sm,
  },
  historyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  historyMeta: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  loading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
