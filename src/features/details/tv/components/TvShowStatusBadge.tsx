import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { translateTvShowStatus } from '../utils/tv-show-status';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface TvShowStatusBadgeProps {
  status: string;
}

export function TvShowStatusBadge({ status }: TvShowStatusBadgeProps) {
  const { t } = useTranslation();
  const label = translateTvShowStatus(status, t);

  if (!label) {
    return null;
  }

  return (
    <View style={styles.badge} accessibilityRole="text" accessibilityLabel={label}>
      <AppText variant="caption" style={styles.badgeText}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textSecondary,
  },
});
