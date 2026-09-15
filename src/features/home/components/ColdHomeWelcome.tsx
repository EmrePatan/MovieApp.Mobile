import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ColdHomeWelcomeProps {
  onExplorePress: () => void;
}

export function ColdHomeWelcome({ onExplorePress }: ColdHomeWelcomeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles-outline" size={28} color={colors.accent} />
        </View>
        <AppText variant="title" style={styles.title}>
          Find your next favorite
        </AppText>
        <AppText variant="bodySmall" muted style={styles.message}>
          Explore movies and shows to start building your recommendations.
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explore movies and shows"
          onPress={onExplorePress}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <AppText variant="bodySmall" style={styles.ctaText}>
            Explore
          </AppText>
          <Ionicons name="arrow-forward" size={16} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
  },
  message: {
    lineHeight: 20,
  },
  cta: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
