import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { Genre } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ExploreGenreSectionProps {
  genres: Genre[];
  onGenrePress: (genreId: string) => void;
}

export function ExploreGenreSection({ genres, onGenrePress }: ExploreGenreSectionProps) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title}>
        Explore by Genre
      </AppText>
      <View style={styles.chipGrid}>
        {genres.map((genre) => (
          <Pressable
            key={genre.id}
            accessibilityRole="button"
            accessibilityLabel={`Browse ${genre.name}`}
            onPress={() => onGenrePress(genre.id)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <AppText variant="caption" style={styles.chipLabel}>
              {genre.name}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipLabel: {
    color: colors.textPrimary,
  },
});
