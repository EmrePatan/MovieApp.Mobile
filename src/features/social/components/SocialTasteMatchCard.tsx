import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { useInsightsCompare } from '@/features/insights/hooks/useInsightsCompare';
import { translateGenreName } from '@/i18n/catalog-labels';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const RING = 84;
const STROKE = 7;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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

/** "Taste match" card for someone else's profile: overlap ring plus the genres you both love. */
export function SocialTasteMatchCard({ userId, enabled }: SocialTasteMatchCardProps) {
  useAuthFonts();
  const { t } = useTranslation();
  const compare = useInsightsCompare(userId, enabled);
  const data = compare.data;

  // A match needs watch history on both sides; otherwise "0%" would read as "opposite tastes".
  if (!data || data.myTopGenres.length === 0 || data.theirTopGenres.length === 0) {
    return null;
  }

  const dash = (Math.max(0, Math.min(100, data.matchPercent)) / 100) * CIRCUMFERENCE;

  return (
    <View style={styles.card} testID="social-taste-match">
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(212, 179, 106, 0.16)', 'rgba(212, 179, 106, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.top}>
        <View style={styles.ringWrap}>
          <Svg width={RING} height={RING}>
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke="#ECD296"
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <AppText style={styles.percent}>{`%${data.matchPercent}`}</AppText>
          </View>
        </View>
        <View style={styles.copy}>
          <AppText variant="caption" style={styles.kicker}>
            {t('social.tasteMatchTitle')}
          </AppText>
          <AppText style={styles.band}>{t(`social.${bandKey(data.matchPercent)}`)}</AppText>
        </View>
      </View>

      {data.sharedGenres.length > 0 ? (
        <View style={styles.shared}>
          <AppText variant="caption" muted>
            {t('social.tasteMatchShared')}
          </AppText>
          <View style={styles.chipRow}>
            {data.sharedGenres.map((genre) => (
              <View key={genre.genreId} style={styles.chip}>
                <AppText variant="caption" style={styles.chipName}>
                  {translateGenreName(genre.name)}
                </AppText>
                <AppText variant="caption" muted style={styles.chipShares}>
                  {`${t('social.tasteMatchYou')} ${Math.round(genre.myShare)}% · ${t('social.tasteMatchThey')} ${Math.round(genre.theirShare)}%`}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(236, 210, 150, 0.35)',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    color: colors.accentStrong,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 24,
    lineHeight: 30,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    color: colors.accentStrong,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  band: {
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 20,
    lineHeight: 26,
  },
  shared: {
    gap: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: glass.panelElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  chipName: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  chipShares: {
    fontSize: 10,
  },
});
