import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { translateGenreName } from '@/i18n/catalog-labels';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { InsightsV3Response } from '../types';
import {
  formatAverageStarRating,
  formatMovieDnaDisplayTitle,
  formatWatchTimeBreakdown,
} from '../utils/insights-format';

interface InsightsShareSheetProps {
  visible: boolean;
  onClose: () => void;
  insights: InsightsV3Response;
  year: number;
}

/**
 * A poster-sized "year in cinema" card. It renders on screen first, then the
 * same view is captured to a PNG for the OS share sheet. When the native
 * capture/sharing modules are missing (older dev client) it falls back to text.
 */
export function InsightsShareSheet({ visible, onClose, insights, year }: InsightsShareSheetProps) {
  useAuthFonts();
  const { t } = useTranslation();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  const dnaTitle = formatMovieDnaDisplayTitle(insights.movieDna);
  const duration = formatWatchTimeBreakdown(insights.timeInStories.totalMinutes);
  const genres = insights.movieDna.topGenres.slice(0, 3);
  const average = insights.yourRatings.averageStars;
  const posterUri = resolveImageUri(insights.yourEra.oldestTitle?.posterPath, 'w500');

  const shareText = useCallback(async () => {
    await Share.share({ message: t('insights.hub.shareMessage', { dna: dnaTitle, duration }) });
  }, [dnaTitle, duration, t]);

  const handleShare = useCallback(async () => {
    if (busy) {
      return;
    }
    setBusy(true);
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
    } catch {
      try {
        await shareText();
      } catch {
        // User dismissed the sheet or sharing is unavailable.
      }
    } finally {
      setBusy(false);
    }
  }, [busy, shareText]);

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
            <AppText variant="caption" style={styles.brand}>
              MOVIE CAVE · {year}
            </AppText>
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

          <View style={styles.cardBottom}>
            <View style={styles.stat}>
              <AppText style={styles.statValue} numberOfLines={2}>
                {duration}
              </AppText>
              <AppText variant="caption" style={styles.statLabel}>
                {t('insights.timeInStories.watchTimeLabel')}
              </AppText>
            </View>
            {average != null ? (
              <View style={[styles.stat, styles.statRight]}>
                <View style={styles.starLine}>
                  <Ionicons name="star" size={16} color={colors.accentStrong} />
                  <AppText style={styles.statValue}>{formatAverageStarRating(average)}</AppText>
                </View>
                <AppText variant="caption" style={styles.statLabel}>
                  {t('insights.share.avgRating')}
                </AppText>
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
    maxWidth: 320,
    aspectRatio: 4 / 5,
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
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
    fontSize: 26,
    lineHeight: 32,
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
});
