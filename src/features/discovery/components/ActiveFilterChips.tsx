import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { Genre } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
}

export function buildActiveFilterChips(
  filters: {
    genreIds: string[];
    year: number | null;
    minRating: number | null;
    language: string | null;
    sortLabel: string | null;
  },
  genres: Genre[],
  handlers: {
    onRemoveGenre: (genreId: string) => void;
    onRemoveYear: () => void;
    onRemoveMinRating: () => void;
    onRemoveLanguage: () => void;
    onRemoveSort: () => void;
  },
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  for (const genreId of filters.genreIds) {
    const genre = genres.find((entry) => entry.id === genreId);
    chips.push({
      key: `genre-${genreId}`,
      label: genre?.name ?? 'Genre',
      onRemove: () => handlers.onRemoveGenre(genreId),
    });
  }

  if (filters.year != null) {
    chips.push({
      key: 'year',
      label: `Year ${filters.year}`,
      onRemove: handlers.onRemoveYear,
    });
  }

  if (filters.minRating != null) {
    chips.push({
      key: 'minRating',
      label: `Rating ${filters.minRating}+`,
      onRemove: handlers.onRemoveMinRating,
    });
  }

  if (filters.language) {
    chips.push({
      key: 'language',
      label: filters.language.toUpperCase(),
      onRemove: handlers.onRemoveLanguage,
    });
  }

  if (filters.sortLabel) {
    chips.push({
      key: 'sort',
      label: filters.sortLabel,
      onRemove: handlers.onRemoveSort,
    });
  }

  return chips;
}

export function ActiveFilterChips({ chips }: ActiveFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessibilityRole="list"
    >
      {chips.map((chip) => (
        <View key={chip.key} style={styles.chip}>
          <AppText variant="caption" style={styles.label}>{chip.label}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${chip.label} filter`}
            onPress={chip.onRemove}
            hitSlop={8}
            style={styles.removeButton}
          >
            <Ionicons name="close" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 32,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  removeButton: {
    padding: spacing.xs,
  },
});
