import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/auth/useAuth';
import { useSocialProfileStatistics } from '../hooks/useSocialQueries';
import type { SocialProfileShelfItem, SocialProfileStatistics } from '../types';
import { findCommonWatchedTitles } from '../utils/find-common-titles';

const POSTER_W = 72;
const POSTER_H = 108;

interface SocialCommonTitlesStripProps {
  theirStatistics: SocialProfileStatistics | undefined;
  onOpenTitle: (item: SocialProfileShelfItem) => void;
}

/** "Watched by both of you" shelf on someone else's profile. */
export function SocialCommonTitlesStrip({
  theirStatistics,
  onOpenTitle,
}: SocialCommonTitlesStripProps) {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const mine = useSocialProfileStatistics(me?.id ?? '', Boolean(me?.id));
  const common = useMemo(
    () => findCommonWatchedTitles(mine.data, theirStatistics),
    [mine.data, theirStatistics],
  );

  if (common.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap} testID="social-common-titles">
      <View style={styles.header}>
        <AppText variant="subtitle">{t('extras.commonWatchedTitle')}</AppText>
        <AppText variant="caption" muted>
          {t('extras.commonWatchedCount', { count: common.length })}
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {common.slice(0, 20).map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => onOpenTitle(item)}
            style={({ pressed }) => [styles.poster, pressed && styles.pressed]}
          >
            <CatalogImage
              path={item.posterPath}
              width={POSTER_W}
              height={POSTER_H}
              accessibilityLabel={item.title}
              rounded={false}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  poster: {
    width: POSTER_W,
    height: POSTER_H,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  pressed: { opacity: 0.85 },
});
