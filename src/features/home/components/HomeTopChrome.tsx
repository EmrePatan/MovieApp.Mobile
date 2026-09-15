import { StyleSheet, View } from 'react-native';
import { GlobalSearchEntry } from '@/features/navigation/components/GlobalSearchEntry';
import { HomeHeader } from './HomeHeader';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function HomeTopChrome() {
  return (
    <View style={styles.container}>
      <HomeHeader />
      <GlobalSearchEntry origin="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
});
