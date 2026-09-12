import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface PlaceholderScreenProps {
  title: string;
  subtitle: string;
  description: string;
}

export function PlaceholderScreen({ title, subtitle, description }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <AppText variant="caption" muted center style={styles.eyebrow}>
        {title}
      </AppText>
      <AppText variant="hero" center style={styles.subtitle}>
        {subtitle}
      </AppText>
      <AppText variant="body" muted center style={styles.description}>
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  description: {
    marginTop: spacing.md,
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
