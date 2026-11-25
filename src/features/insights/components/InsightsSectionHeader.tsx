import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface InsightsSectionHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  /** Chapter number shown as a gold eyebrow, e.g. 1 -> "01". */
  index?: number;
}

export function InsightsSectionHeader({
  title,
  subtitle,
  trailing,
  index,
}: InsightsSectionHeaderProps) {
  useAuthFonts();

  return (
    <View style={styles.wrap}>
      {index != null ? (
        <View style={styles.eyebrowRow} accessibilityElementsHidden>
          <AppText variant="caption" style={styles.eyebrow}>
            {String(index).padStart(2, '0')}
          </AppText>
          <LinearGradient
            colors={['rgba(236, 210, 150, 0.45)', 'rgba(236, 210, 150, 0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.eyebrowLine}
          />
        </View>
      ) : null}
      <View style={styles.container}>
        <View style={styles.copy}>
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="bodySmall" muted style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    marginBottom: spacing.xs,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.accentStrong,
    fontWeight: '700',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  eyebrowLine: {
    flex: 1,
    height: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: authTypography.wordmarkSemibold,
    fontWeight: 'normal',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  subtitle: {
    lineHeight: 20,
    color: colors.textMuted,
  },
  trailing: {
    paddingTop: 4,
  },
});
