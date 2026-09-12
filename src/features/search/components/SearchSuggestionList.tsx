import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { SearchAutocompleteItem } from '../types';
import { formatContentType } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const AUTOCOMPLETE_THUMB_WIDTH = 36;
const AUTOCOMPLETE_THUMB_HEIGHT = 54;

function SearchSuggestionLeadingVisual({ suggestion }: { suggestion: SearchAutocompleteItem }) {
  if (suggestion.posterUrl) {
    return (
      <PosterImage
        uri={suggestion.posterUrl}
        width={AUTOCOMPLETE_THUMB_WIDTH}
        height={AUTOCOMPLETE_THUMB_HEIGHT}
        accessibilityLabel={`${suggestion.title} poster`}
      />
    );
  }

  const iconName: ComponentProps<typeof Ionicons>['name'] =
    suggestion.type === 'tv' ? 'tv-outline' : 'film-outline';

  return (
    <View
      style={styles.leadingIcon}
      accessibilityLabel={
        suggestion.type === 'tv' ? 'TV show suggestion' : 'Movie suggestion'
      }
    >
      <Ionicons name={iconName} size={20} color={colors.textSecondary} />
    </View>
  );
}

interface SearchSuggestionListProps {
  suggestions: SearchAutocompleteItem[];
  isLoading: boolean;
  onSelect: (suggestion: SearchAutocompleteItem) => void;
}

export function SearchSuggestionList({
  suggestions,
  isLoading,
  onSelect,
}: SearchSuggestionListProps) {
  if (isLoading && suggestions.length === 0) {
    return (
      <View style={styles.loading} accessibilityLabel="Loading suggestions">
        <ActivityIndicator color={colors.accent} size="small" />
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.empty} accessibilityLabel="No suggestions">
        <AppText variant="caption" muted>No suggestions</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityRole="list">
      {suggestions.map((suggestion, index) => (
        <Pressable
          key={`${suggestion.type}-${suggestion.id}`}
          accessibilityRole="button"
          accessibilityLabel={`Search for ${suggestion.title}, ${formatContentType(suggestion.type)}`}
          onPress={() => onSelect(suggestion)}
          style={({ pressed }) => [
            styles.row,
            index < suggestions.length - 1 && styles.rowBorder,
            pressed && styles.pressed,
          ]}
        >
          <SearchSuggestionLeadingVisual suggestion={suggestion} />
          <AppText variant="bodySmall" numberOfLines={1} style={styles.title}>
            {suggestion.title}
          </AppText>
          <AppText variant="caption" muted style={styles.typeLabel}>
            {formatContentType(suggestion.type)}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  loading: {
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  empty: {
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  leadingIcon: {
    width: AUTOCOMPLETE_THUMB_WIDTH,
    height: AUTOCOMPLETE_THUMB_HEIGHT,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.inputBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: AUTOCOMPLETE_THUMB_HEIGHT + spacing.sm * 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surface,
    opacity: interaction.pressedOpacity,
  },
  title: {
    flex: 1,
  },
  typeLabel: {
    letterSpacing: 0.2,
  },
});
