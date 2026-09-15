import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { PersonFilmographyEntry } from '../types';
import { spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

interface PersonFilmographyPreviewCardProps {
  entry: PersonFilmographyEntry;
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

export function PersonFilmographyPreviewCard({
  entry,
  busy = false,
  onPress,
}: PersonFilmographyPreviewCardProps) {
  const year = formatYear(entry.releaseDate);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.title}${year ? `, ${year}` : ''}`}
      disabled={busy}
      onPress={() => onPress(entry)}
      style={styles.container}
      testID={`person-filmography-preview-${entry.mediaType}-${entry.tmdbId}`}
    >
      <PosterImage
        uri={entry.posterPath}
        width={layout.posterCarousel.width}
        height={layout.posterCarousel.height}
        accessibilityLabel={`${entry.title} poster`}
      />
      <AppText variant="caption" numberOfLines={2} style={styles.title}>
        {entry.title}
      </AppText>
      {year ? (
        <AppText variant="caption" muted>
          {year}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: layout.posterCarousel.width,
    gap: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
  },
});
