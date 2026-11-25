import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { SocialProfileStatistics } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface SocialProfileStatStripProps {
  statistics?: SocialProfileStatistics;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function SocialProfileStatStrip({
  statistics,
  isLoading,
  isError,
  onRetry,
}: SocialProfileStatStripProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.wrap}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.wrap}>
        <AppText variant="caption" muted>
          {t('social.statsLoadError')}
        </AppText>
        <Pressable accessibilityRole="button" onPress={onRetry}>
          <AppText variant="caption" style={styles.retry}>
            {t('common.retry')}
          </AppText>
        </Pressable>
      </View>
    );
  }

  if (!statistics) {
    return null;
  }

  const line = [
    `${statistics.moviesWatched} ${t('social.movies')}`,
    `${statistics.episodesWatched} ${t('social.episodes')}`,
    `${statistics.ratingsCount} ${t('social.ratingCount')}`,
    `${statistics.reviewsCount} ${t('social.reviewCount')}`,
    `${statistics.favoritesCount} ${t('social.favoriteCount')}`,
  ].join(' · ');

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" muted numberOfLines={4} style={styles.line}>
        {line}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.md,
  },
  line: {
    lineHeight: 18,
  },
  retry: {
    color: colors.accent,
    marginTop: spacing.xs,
  },
});