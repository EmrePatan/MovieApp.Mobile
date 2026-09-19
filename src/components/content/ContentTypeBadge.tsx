import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { translateContentType } from '@/i18n/catalog-labels';
import type { ContentType } from '@/models/api/pagination';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ContentTypeBadgeProps {
  type: ContentType;
}

export function ContentTypeBadge({ type }: ContentTypeBadgeProps) {
  return (
    <View style={styles.badge} accessibilityLabel={translateContentType(type)}>
      <AppText variant="caption" style={styles.badgeText}>
        {translateContentType(type)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
});
