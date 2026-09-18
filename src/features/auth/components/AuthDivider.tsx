import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { spacing } from '@/theme/spacing';

interface AuthDividerProps {
  label: string;
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: 'rgba(245, 245, 247, 0.58)',
    fontWeight: '600',
  },
});
