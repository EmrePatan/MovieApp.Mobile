import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, ClipPath, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { useInsightsCompare } from '@/features/insights/hooks/useInsightsCompare';
import { translateGenreName } from '@/i18n/catalog-labels';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

const VENN_W = 220;
const VENN_H = 124;
const VENN_R = 52;
const VENN_CY = VENN_H / 2;
const REVEAL_MS = 1100;

interface SocialTasteMatchCardProps {
  userId: string;
  /** Skip the request when the profile's activity is hidden from the viewer. */
  enabled: boolean;
}

function bandKey(percent: number) {
  if (percent >= 75) return 'tasteMatchTwin';
  if (percent >= 50) return 'tasteMatchClose';
  if (percent >= 25) return 'tasteMatchMixed';
  return 'tasteMatchOpposite';
}

/** "post-apocalyptic future" → "Post-Apocalyptic Future": keyword names arrive lowercase. */
function titleCase(value: string) {
  return value.replace(
    /(^|[\s-])(\p{L})/gu,
    (_match, lead: string, letter: string) => lead + letter.toUpperCase(),
  );
}

/** 0 → 1 over REVEAL_MS each time the sheet opens, so the circles, number and bars play in. */
function useReveal(active: boolean) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const value = new Animated.Value(0);
    const id = value.addListener(({ value: next }) => setProgress(next));
    Animated.timing(value, {
      toValue: 1,
      duration: REVEAL_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => {
      value.removeListener(id);
      value.stopAnimation();
    };
  }, [active]);
  return active ? progress : 0;
}

/**
 * Compact "taste match" badge for someone else's profile header. Tapping it opens a showcase
 * sheet: the two taste circles slide together, the percentage counts up and the shared genres fill.
 */
export function SocialTasteMatchCard({ userId, enabled }: SocialTasteMatchCardProps) {
  useAuthFonts();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const progress = useReveal(open);
  const compare = useInsightsCompare(userId, enabled);
  const data = compare.data;

  // A match needs watch history on both sides; otherwise "0%" would read as "opposite tastes".
  if (!data || data.myTopGenres.length === 0 || data.theirTopGenres.length === 0) {
    return null;
  }

  const percent = Math.max(0, Math.min(100, data.matchPercent));
  // Circles start far apart and settle: near-coincident at 100%, just touching at 0%.
  const settledGap = 2 * VENN_R * (1 - (percent / 100) * 0.82);
  const gap = settledGap + (1 - progress) * VENN_R * 1.4;
  const leftX = VENN_W / 2 - gap / 2;
  const rightX = VENN_W / 2 + gap / 2;
  const shownPercent = Math.round(percent * progress);

  return (
    <>
      <View style={styles.badgeColumn}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('social.tasteMatchTitle')} %${percent}`}
          onPress={() => setOpen(true)}
          hitSlop={8}
          style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
          testID="social-taste-match"
        >
          <Ionicons name="heart" size={16} color={colors.accentStrong} />
          <AppText style={styles.badgePercent}>{`%${percent}`}</AppText>
        </Pressable>
        <AppText style={styles.badgeCaption} numberOfLines={2}>
          {t('social.tasteMatchCaption')}
        </AppText>
      </View>

      <AppBottomSheet visible={open} onClose={() => setOpen(false)}>
        <View style={styles.sheetBody}>
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(236, 210, 150, 0.22)', 'rgba(236, 210, 150, 0)']}
            style={styles.glow}
          />
          <AppText variant="caption" style={styles.kicker}>
            {t('social.tasteMatchTitle')}
          </AppText>

          <Svg width={VENN_W} height={VENN_H}>
            <Defs>
              <ClipPath id="tm-left">
                <Circle cx={leftX} cy={VENN_CY} r={VENN_R} />
              </ClipPath>
              <RadialGradient id="tm-halo" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ECD296" stopOpacity={0.45 * progress} />
                <Stop offset="100%" stopColor="#ECD296" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={VENN_W / 2} cy={VENN_CY} r={VENN_R * 1.7} fill="url(#tm-halo)" />
            <Circle
              cx={leftX}
              cy={VENN_CY}
              r={VENN_R}
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={1.4}
            />
            <Circle
              cx={rightX}
              cy={VENN_CY}
              r={VENN_R}
              fill="rgba(212,179,106,0.10)"
              stroke="#ECD296"
              strokeWidth={1.4}
            />
            <Circle
              cx={rightX}
              cy={VENN_CY}
              r={VENN_R}
              fill="rgba(236,210,150,0.5)"
              clipPath="url(#tm-left)"
            />
          </Svg>

          <AppText style={styles.percent}>{`%${shownPercent}`}</AppText>
          <AppText style={styles.band}>{t(`social.${bandKey(percent)}`)}</AppText>

          {data.sharedGenres.length > 0 ? (
            <View style={styles.shared}>
              <View style={styles.sharedHeader}>
                <AppText variant="caption" muted>
                  {t('social.tasteMatchShared')}
                </AppText>
                <View style={styles.legend}>
                  <View style={[styles.legendDot, styles.youFill]} />
                  <AppText variant="caption" muted>
                    {t('social.tasteMatchYou')}
                  </AppText>
                  <View style={[styles.legendDot, styles.theyFill]} />
                  <AppText variant="caption" muted>
                    {t('social.tasteMatchThey')}
                  </AppText>
                </View>
              </View>
              {data.sharedGenres.map((genre) => (
                <View key={genre.genreId} style={styles.genreRow}>
                  <AppText variant="caption" style={styles.genreName} numberOfLines={1}>
                    {translateGenreName(genre.name)}
                  </AppText>
                  <View style={styles.bars}>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.bar,
                          styles.youFill,
                          { width: `${Math.min(100, genre.myShare * 2) * progress}%` },
                        ]}
                      />
                    </View>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.bar,
                          styles.theyFill,
                          { width: `${Math.min(100, genre.theirShare * 2) * progress}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <AppText variant="caption" muted style={styles.genreValues}>
                    {`${Math.round(genre.myShare)} · ${Math.round(genre.theirShare)}`}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
          {data.sharedKeywords && data.sharedKeywords.length > 0 ? (
            <View style={styles.keywords}>
              <AppText variant="caption" muted>
                {t('social.tasteMatchKeywords')}
              </AppText>
              <View style={styles.keywordRow}>
                {data.sharedKeywords.map((keyword) => (
                  <View key={keyword.keywordId} style={styles.keywordChip}>
                    <AppText variant="caption" style={styles.keywordText}>
                      {titleCase(keyword.name)}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </AppBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  badgeColumn: {
    alignItems: 'center',
    gap: 4,
    maxWidth: 84,
  },
  badgeCaption: {
    fontSize: 10,
    lineHeight: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: glass.panelElevated,
    borderWidth: 1,
    borderColor: 'rgba(236, 210, 150, 0.45)',
  },
  badgePercent: {
    color: colors.accentStrong,
    fontWeight: '800',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  sheetBody: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    top: -spacing.lg,
    height: 220,
    borderRadius: 24,
  },
  kicker: {
    color: colors.accentStrong,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  percent: {
    color: colors.accentStrong,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 56,
    lineHeight: 64,
  },
  band: {
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  shared: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: glass.hairline,
  },
  sharedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  genreName: {
    width: 84,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bars: {
    flex: 1,
    gap: 3,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  bar: {
    height: 5,
    borderRadius: 3,
  },
  youFill: {
    backgroundColor: '#ECD296',
  },
  theyFill: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  keywords: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: glass.hairline,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  keywordChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(236, 210, 150, 0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(236, 210, 150, 0.35)',
  },
  keywordText: {
    color: colors.accentStrong,
    fontWeight: '600',
    fontSize: 12,
  },
  genreValues: {
    width: 44,
    textAlign: 'right',
    fontSize: 11,
  },
});
