import { StyleSheet, View } from 'react-native';
import { HomeHeader } from './HomeHeader';
import { HomeTypeFilterControl } from './HomeTypeFilterControl';
import type { HomeTypeFilter } from '../types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface HomeTopChromeProps {
  typeFilter: HomeTypeFilter;
  onTypeFilterChange: (value: HomeTypeFilter) => void;
}

export function HomeTopChrome({ typeFilter, onTypeFilterChange }: HomeTopChromeProps) {
  return (
    <View style={styles.container}>
      <HomeHeader />
      <HomeTypeFilterControl value={typeFilter} onChange={onTypeFilterChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
});
