import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { computeLevel, groupAchievements, totalPoints } from '@/features/achievements/achievement-model';
import { LevelSeal } from '@/features/achievements/components/AchievementLevelBadge';
import { useAchievementCopy } from '@/features/achievements/useAchievementCopy';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { translateGenreName } from '@/i18n/catalog-labels';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { InsightsV3Response } from '../types';
import {
  formatAverageStarRating,
  formatDecadeLabel,
  formatMonthLongName,
  formatMovieDnaDisplayTitle,
  formatWatchTimeBreakdown,
  formatWeekdayName,
} from '../utils/insights-format';

/**
 * Font size that keeps `text` on one line in a box that fits `maxChars` characters at `base` size.
 * adjustsFontSizeToFit is ignored on web and by the screenshot path, so the size is computed.
 */
function fitFont(text: string, base: number, maxChars: number, minScale = 0.6, spaced = false) {
  const scale = Math.max(minScale, Math.min(1, maxChars / Math.max(1, text.length)));
  const fontSize = Math.round(base * scale * 10) / 10;
  // Uppercase labels carry letter spacing; shrink it with the font so it cannot push the text out.
  return spaced ? { fontSize, letterSpacing: Math.min(1, fontSize / 10) } : { fontSize };
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.mini}>
      <AppText style={[styles.miniValue, fitFont(value, 17, 7, 0.5)]} numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="caption" style={[styles.statLabel, fitFont(label, 10, 11, 0.5, true)]} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

interface InsightsShareSheetProps {
  visible: boolean;
  onClose: () => void;
  insights: InsightsV3Response;
  year: number;
  /** Poster path chosen as the card backdrop (the member's DNA cover). */
  coverPath?: string | null;
}

/**
 * A poster-sized "year in cinema" card. It renders on screen first, then the
 * same view is captured to a PNG for the OS share sheet. When the native
 * capture/sharing modules are missing (older dev client) it falls back to text.
 */
export function InsightsShareSheet({
  visible,
  onClose,
  insights,
  year,
  coverPath,
}: InsightsShareSheetProps) {
  useAuthFonts();
  const { t } = useTranslation();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const dnaTitle = formatMovieDnaDisplayTitle(insights.movieDna);
  const duration = formatWatchTimeBreakdown(insights.timeInStories.totalMinutes);
  const genres = insights.movieDna.topGenres.slice(0, 3);
  const average = insights.yourRatings.averageStars;
  const posterUri = resolveImageUri(
    coverPath ?? insights.yourEra.oldestTitle?.posterPath,
    'w500',
  );
  const { levelName } = useAchievementCopy();
  const level = useMemo(
    () => computeLevel(totalPoints(groupAchievements(insights.achievements))),
    [insights.achievements],
  );
  const bars = useMemo(() => {
    const months = insights.yourYear.months;
    const max = Math.max(1, ...months.map((month) => month.total));
    const peakTotal = Math.max(...months.map((month) => month.total), 0);
    return months.map((month) => ({
      key: `${month.year}-${month.month}`,
      ratio: month.total / max,
      peak: peakTotal > 0 && month.total === peakTotal,
    }));
  }, [insights.yourYear.months]);

  // Second stat row: era, streak and movie/series split — each only when the data exists.
  const extraStats = useMemo(() => {
    const stats: { key: string; value: string; label: string }[] = [];
    const decade = insights.yourEra.favoriteDecade;
    if (decade) {
      stats.push({ key: 'era', value: formatDecadeLabel(decade), label: t('insights.share.favoriteEra') });
    }
    const streak = insights.yourRecords.longestStreakDays;
    if (streak != null && streak > 0) {
      stats.push({
        key: 'streak',
        value: t('insights.share.streakDays', { days: streak }),
        label: t('insights.share.longestStreak'),
      });
    }
    const mix = insights.movieDna.watchingMix;
    if (mix.movieTitleCount + mix.seriesTitleCount > 0) {
      stats.push({
        key: 'mix',
        value: `${Math.round(mix.movieSharePercent)}/${Math.round(mix.seriesSharePercent)}`,
        label: t('insights.share.mixLabel'),
      });
    }
    return stats;
  }, [insights.movieDna.watchingMix, insights.yourEra.favoriteDecade, insights.yourRecords.longestStreakDays, t]);

  const shareText = useCallback(async () => {
    await Share.share({ message: t('insights.hub.shareMessage', { dna: dnaTitle, duration }) });
  }, [dnaTitle, duration, t]);

  const handleShare = useCallback(async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      // Optional native modules: absent in a dev client built before they were added.
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { captureRef } = require('react-native-view-shot');
      const Sharing = require('expo-sharing');
      /* eslint-enable @typescript-eslint/no-require-imports */
      const uri: string = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
        return;
      }
      await shareText();
    } catch (error) {
      if (__DEV__) {
        console.warn('Insights share image failed, falling back to text', error);
      }
      // Say why the image failed instead of silently degrading to text.
      const reason = error instanceof Error ? error.message : String(error);
      setFailure(t('extras.shareImageFailed', { reason: reason.slice(0, 140) }));
      try {
        await shareText();
      } catch {
        // User dismissed the sheet or sharing is unavailable.
      }
    } finally {
      setBusy(false);
    }
  }, [busy, shareText, t]);

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title={t('insights.share.title')}
      testID="insights-share-sheet"
    >
      <View style={styles.body}>
        <View ref={cardRef} collapsable={false} style={styles.card}>
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              blurRadius={22}
              cachePolicy="memory-disk"
            />
          ) : null}
          <LinearGradient
            colors={['rgba(10,10,15,0.55)', 'rgba(10,10,15,0.82)', 'rgba(10,10,15,0.96)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardTop}>
            <View style={styles.brandRow}>
              <AppText variant="caption" style={styles.brand}>
                MOVIE CAVE · {year}
              </AppText>
              <View style={styles.levelTag}>
                <LevelSeal level={level.level} size={22} />
                <AppText variant="caption" style={styles.levelName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {levelName(level.level)}
                </AppText>
              </View>
            </View>
            <View style={styles.rule} />
          </View>

          <View style={styles.cardMiddle}>
            <AppText variant="caption" style={styles.kicker}>
              {t('insights.movieDna.kicker')}
            </AppText>
            <AppText style={styles.dna}>{dnaTitle}</AppText>
            <View style={styles.genreRow}>
              {genres.map((genre) => (
                <View key={genre.genreId} style={styles.genreChip}>
                  <AppText variant="caption" style={styles.genreText}>
                    {translateGenreName(genre.name)}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {bars.length > 0 ? (
            <View style={styles.bars} accessibilityElementsHidden>
              {bars.map((bar) => (
                <View key={bar.key} style={styles.barSlot}>
                  <View
                    style={[
                      styles.bar,
                      bar.peak && styles.barPeak,
                      { height: Math.max(3, Math.round(bar.ratio * 34)) },
                    ]}
                  />
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.cardBottom}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <AppText style={styles.statValue} numberOfLines={2}>
                  {duration}
                </AppText>
                <AppText
                  variant="caption"
                  style={[styles.statLabel, fitFont(t('insights.timeInStories.watchTimeLabel'), 10, 18, 0.6, true)]}
                  numberOfLines={1}
                >
                  {t('insights.timeInStories.watchTimeLabel')}
                </AppText>
              </View>
              {average != null ? (
                <View style={[styles.stat, styles.statRight]}>
                  <View style={styles.starLine}>
                    <Ionicons name="star" size={16} color={colors.accentStrong} />
                    <AppText style={styles.statValue}>{formatAverageStarRating(average)}</AppText>
                  </View>
                  <AppText
                    variant="caption"
                    style={[styles.statLabel, fitFont(t('insights.share.avgRating'), 10, 12, 0.6, true)]}
                    numberOfLines={1}
                  >
                    {t('insights.share.avgRating')}
                  </AppText>
                </View>
              ) : null}
            </View>
            <View style={styles.miniRow}>
              <MiniStat
                value={String(insights.yourYear.activeDays)}
                label={t('insights.share.activeDays')}
              />
              {insights.yourYear.peakMonth ? (
                <MiniStat
                  value={formatMonthLongName(insights.yourYear.peakMonth.month)}
                  label={t('insights.share.peakMonth')}
                />
              ) : null}
              {insights.yourYear.favoriteWeekday != null ? (
                <MiniStat
                  value={formatWeekdayName(insights.yourYear.favoriteWeekday)}
                  label={t('insights.share.favoriteDay')}
                />
              ) : null}
            </View>
            {extraStats.length > 0 ? (
              <View style={styles.miniRow} testID="insights-share-extra-stats">
                {extraStats.map((stat) => (
                  <MiniStat key={stat.key} value={stat.value} label={stat.label} />
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('insights.share.cta')}
          onPress={() => void handleShare()}
          disabled={busy}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          testID="insights-share-cta"
        >
          {busy ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <>
              <Ionicons name="share-outline" size={18} color={colors.background} />
              <AppText style={styles.ctaText}>{t('insights.share.cta')}</AppText>
            </>
          )}
        </Pressable>
        {failure ? (
          <AppText variant="caption" style={styles.failure} testID="insights-share-failure">
            {failure}
          </AppText>
        ) : null}
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 3 / 5,
    borderRadius: 28,
    overflow: 'hidden',
    padding: spacing.lg,
    justifyContent: 'space-between',
    backgroundColor: '#120E16',
    borderWidth: 1,
    borderColor: 'rgba(236, 210, 150, 0.45)',
  },
  cardTop: {
    gap: spacing.sm,
  },
  brand: {
    color: colors.accentStrong,
    letterSpacing: 2.4,
    fontWeight: '700',
  },
  rule: {
    height: 1,
    backgroundColor: 'rgba(236, 210, 150, 0.4)',
  },
  cardMiddle: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  kicker: {
    color: colors.textSecondary,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  dna: {
    color: colors.accentStrong,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 36,
    lineHeight: 42,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  genreChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(236, 210, 150, 0.5)',
    backgroundColor: 'rgba(212, 179, 106, 0.14)',
  },
  genreText: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
  cardBottom: {
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  levelName: {
    color: colors.accentStrong,
    fontWeight: '700',
    flexShrink: 1,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 36,
    gap: 4,
  },
  barSlot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 3,
    backgroundColor: 'rgba(236, 210, 150, 0.32)',
  },
  barPeak: {
    backgroundColor: colors.accentStrong,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  miniRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(236, 210, 150, 0.35)',
  },
  mini: {
    flex: 1,
    gap: 2,
  },
  miniValue: {
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 17,
    lineHeight: 22,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statRight: {
    alignItems: 'flex-end',
    flex: 0,
    minWidth: 90,
  },
  starLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 24,
    lineHeight: 30,
  },
  statLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentStrong,
  },
  ctaText: {
    color: colors.background,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
  failure: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
