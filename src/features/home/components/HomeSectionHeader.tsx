import { AppText } from '@/components/common/AppText';
import { spacing } from '@/theme/spacing';
import { StyleSheet, View } from 'react-native';

interface HomeSectionHeaderProps {
  title: string;
}

export function HomeSectionHeader({ title }: HomeSectionHeaderProps) {
  return (
    <View style={styles.container} accessibilityRole="header">
      <AppText variant="subtitle">{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
});
