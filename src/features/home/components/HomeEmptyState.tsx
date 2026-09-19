import { EmptyView } from '@/components/common/EmptyView';
import { spacing } from '@/theme/spacing';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface HomeEmptyStateProps {
  title?: string;
  message?: string;
}

export function HomeEmptyState({
  title,
  message,
}: HomeEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <EmptyView
        title={title ?? t('home.empty.title')}
        message={message ?? t('home.empty.message')}
        bordered
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
