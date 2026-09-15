import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { PersonFilmographyEntry } from '../types';
import { formatCatalogYear } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

interface PersonFilmographyCardProps {
  entry: PersonFilmographyEntry;
  busy?: boolean;
  onPress?: (entry: PersonFilmographyEntry) => void;
}

const POSTER_WIDTH = 72;
const POSTER_HEIGHT = Math.round(POSTER_WIDTH * 1.5);

export const PersonFilmographyCard = memo(function PersonFilmographyCard({
  entry,
  busy = false,
  onPress,
}: PersonFilmographyCardProps) {
  const year = formatCatalogYear(entry.releaseDate, null);
  const accessibilityLabel = `${entry.title}${year ? `, ${year}` : ''}${entry.character ? `, as ${entry.character}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={() => onPress?.(entry)}
      style={({ pressed }) => [styles.card, pressed && !busy && styles.pressed, busy && styles.busy]}
    >
      <PosterImage
        uri={entry.posterPath}
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        accessibilityLabel={`${entry.title} poster`}
        elevated
      />
      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <AppText variant="body" numberOfLines={2} style={styles.title}>
            {entry.title}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
        <View style={styles.row}>
          <ContentTypeBadge type={entry.mediaType} />
          {year ? (
            <AppText variant="caption" muted>
              {year}
            </AppText>
          ) : null}
        </View>
        {entry.character ? (
          <AppText variant="caption" muted numberOfLines={2}>
            {entry.character}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minHeight: layout.touchTarget,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  busy: {
    opacity: interaction.busyOpacity,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
