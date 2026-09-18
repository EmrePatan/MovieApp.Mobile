import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { memo, type ComponentProps } from 'react';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { SearchAutocompleteItem } from '../types';
import { formatContentType, formatKnownForDepartment } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const AUTOCOMPLETE_THUMB_WIDTH = 36;
const AUTOCOMPLETE_THUMB_HEIGHT = 54;
const AUTOCOMPLETE_PERSON_THUMB_SIZE = 36;

function formatSuggestionTypeLabel(suggestion: SearchAutocompleteItem): string {
  if (suggestion.type === 'person') {
    const department = formatKnownForDepartment(suggestion.knownForDepartment);
    const typeLabel = formatContentType('person');
    return department ? `${typeLabel} · ${department}` : typeLabel;
  }

  return formatContentType(suggestion.type);
}

function SearchSuggestionLeadingVisual({ suggestion }: { suggestion: SearchAutocompleteItem }) {
  if (suggestion.type === 'person') {
    if (suggestion.posterUrl) {
      return (
        <PosterImage
          uri={suggestion.posterUrl}
          width={AUTOCOMPLETE_PERSON_THUMB_SIZE}
          height={AUTOCOMPLETE_PERSON_THUMB_SIZE}
          accessibilityLabel={`${suggestion.title} portrait`}
        />
      );
    }

    return (
      <View
        style={styles.personLeadingIcon}
        accessibilityLabel="Person suggestion"
      >
        <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
      </View>
    );
  }

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

export const SearchSuggestionList = memo(function SearchSuggestionList({
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
      {suggestions.map((suggestion, index) => {
        const typeLabel = formatSuggestionTypeLabel(suggestion);

        return (
          <Pressable
            key={`${suggestion.type}-${suggestion.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Search for ${suggestion.title}, ${typeLabel}`}
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
              {typeLabel}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
});

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
  personLeadingIcon: {
    width: AUTOCOMPLETE_PERSON_THUMB_SIZE,
    height: AUTOCOMPLETE_PERSON_THUMB_SIZE,
    borderRadius: AUTOCOMPLETE_PERSON_THUMB_SIZE / 2,
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
