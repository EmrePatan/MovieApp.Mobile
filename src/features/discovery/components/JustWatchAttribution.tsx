import { StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function JustWatchAttribution({ testID = 'justwatch-attribution' }: { testID?: string }) {
  return (
    <AppText variant="caption" style={styles.attribution} testID={testID}>
      Data provided by JustWatch
    </AppText>
  );
}

const styles = StyleSheet.create({
  attribution: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
