import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

interface IconEmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

/** Quiet empty state: glass icon disc, one headline, optional supporting line. */
export function IconEmptyState({ icon, title, message }: IconEmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="text" testID="icon-empty-state">
      <View style={styles.disc}>
        <Ionicons name={icon} size={26} color={colors.textSecondary} />
      </View>
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySmall" muted center style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  disc: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    backgroundColor: glass.panelElevated,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  message: {
    maxWidth: 280,
  },
});
