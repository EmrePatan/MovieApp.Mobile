import { EmptyView } from '@/components/common/EmptyView';
import { spacing } from '@/theme/spacing';
import { StyleSheet, View } from 'react-native';

interface HomeEmptyStateProps {
  title?: string;
  message?: string;
}

export function HomeEmptyState({
  title = 'Nothing to watch yet',
  message = 'Explore movies and TV shows to build your personalized home feed.',
}: HomeEmptyStateProps) {
  return (
    <View style={styles.container}>
      <EmptyView title={title} message={message} bordered />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
