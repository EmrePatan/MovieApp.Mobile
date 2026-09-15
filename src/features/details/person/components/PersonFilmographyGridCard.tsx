import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { PersonFilmographyEntry } from '../types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface PersonFilmographyGridCardProps {
  entry: PersonFilmographyEntry;
  width: number;
  showMediaType?: boolean;
  busy?: boolean;
  onPress: (entry: PersonFilmographyEntry) => void;
}

function formatYear(releaseDate: string | null): string | null {
  if (!releaseDate) {
    return null;
  }

  const year = releaseDate.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

export function PersonFilmographyGridCard({
  entry,
  width,
  showMediaType = false,
  busy = false,
  onPress,
}: PersonFilmographyGridCardProps) {
  const year = formatYear(entry.releaseDate);
  const posterHeight = Math.round(width * 1.5);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.title}${year ? `, ${year}` : ''}`}
      disabled={busy}
      onPress={() => onPress(entry)}
      style={styles.container}
      testID={`person-filmography-grid-${entry.mediaType}-${entry.tmdbId}`}
    >
      <PosterImage
        uri={entry.posterPath}
        width={width}
        height={posterHeight}
        accessibilityLabel={`${entry.title} poster`}
      />
      <AppText variant="caption" numberOfLines={2} style={styles.title}>
        {entry.title}
      </AppText>
      <View style={styles.metaRow}>
        {year ? (
          <AppText variant="caption" muted>
            {year}
          </AppText>
        ) : null}
        {showMediaType ? (
          <AppText variant="caption" style={styles.typeBadge}>
            {entry.mediaType === 'movie' ? 'Movie' : 'TV'}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeBadge: {
    color: colors.accent,
    fontWeight: '600',
  },
});
