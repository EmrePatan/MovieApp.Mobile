import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { spacing } from '@/theme/spacing';

interface ProfileSectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function ProfileSectionHeader({ title, subtitle }: ProfileSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" muted>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
    marginBottom: spacing.sm,
  },
  title: {
    letterSpacing: 0.2,
  },
});
