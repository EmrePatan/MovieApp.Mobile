import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { HomeItem } from '@/features/home/types';
import { LibraryStatusIndicator } from './LibraryStatusIndicator';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

import { i18n } from '@/i18n';

interface LibraryContinueWatchingSectionProps {
  items: HomeItem[];
  onItemPress: (item: HomeItem) => void;
}

function formatEpisodeDetail(item: HomeItem): string | null {
  if (item.contentType !== 'tv') {
    return null;
  }

  if (item.seasonNumber != null && item.episodeNumber != null) {
    const titleSuffix = item.episodeName
      ? i18n.t('common.seasonEpisodeTitleSuffix', { title: item.episodeName })
      : '';
    return i18n.t('common.seasonEpisodeWithTitle', {
      season: item.seasonNumber,
      episode: item.episodeNumber,
      titleSuffix,
    });
  }

  return i18n.t('common.inProgress');
}

export function LibraryContinueWatchingSection({
  items,
  onItemPress,
}: LibraryContinueWatchingSectionProps) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="subtitle" style={styles.title}>
        Continue Watching
      </AppText>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const episodeDetail = formatEpisodeDetail(item);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}${episodeDetail ? `, ${episodeDetail}` : ''}`}
              onPress={() => onItemPress(item)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.posterWrap}>
                <CatalogImage
                  path={item.posterUrl}
                  width={layout.posterCarousel.width}
                  height={layout.posterCarousel.height}
                  accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
                />
              </View>
              <AppText variant="caption" numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </AppText>
              <LibraryStatusIndicator
                status="watching"
                label={t('library.categories.watching')}
                detail={episodeDetail}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  title: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: layout.posterCarousel.width,
    gap: spacing.sm,
  },
  posterWrap: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.libraryWatchingTint12,
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
