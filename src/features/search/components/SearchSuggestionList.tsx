import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { SearchAutocompleteItem } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface SearchSuggestionListProps {
  suggestions: SearchAutocompleteItem[];
  isLoading: boolean;
  onSelect: (suggestion: SearchAutocompleteItem) => void;
}

function formatContentType(type: SearchAutocompleteItem['type']): string {
  return type === 'movie' ? 'Movie' : 'TV';
}

export function SearchSuggestionList({
  suggestions,
  isLoading,
  onSelect,
}: SearchSuggestionListProps) {
  if (isLoading && suggestions.length === 0) {
    return (
      <View style={styles.container} accessibilityLabel="Loading suggestions">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="list">
      {suggestions.map((suggestion) => (
        <Pressable
          key={`${suggestion.type}-${suggestion.id}`}
          accessibilityRole="button"
          accessibilityLabel={`Search for ${suggestion.title}, ${formatContentType(suggestion.type)}`}
          onPress={() => onSelect(suggestion)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <AppText variant="body" numberOfLines={1} style={styles.title}>
            {suggestion.title}
          </AppText>
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              {formatContentType(suggestion.type)}
            </AppText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  title: {
    flex: 1,
  },
  badge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
});
