import { StyleSheet, View } from 'react-native';
import { HomeHeader } from './HomeHeader';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function HomeTopChrome() {
  return (
    <View style={styles.container}>
      <HomeHeader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
});
