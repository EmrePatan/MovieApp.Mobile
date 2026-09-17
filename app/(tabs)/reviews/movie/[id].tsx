import { ReviewsDetailContent } from '@/features/reviews/components/ReviewsDetailContent';
import { useReviewsRouteState } from '@/features/reviews/hooks/useReviewsRouteState';
import { AppText } from '@/components/common/AppText';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function MovieReviewsScreen() {
  const { resolvedId, isActive, isInvalid, title } = useReviewsRouteState('movie');

  if (!isActive) {
    return null;
  }

  if (isInvalid || !resolvedId) {
    return (
      <View style={styles.invalidScreen}>
        <SafeAreaView edges={['top']} style={styles.invalidHeader}>
          <DetailBackButton contentInset={false} />
          <AppText variant="body" muted>The reviews link is invalid.</AppText>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <ReviewsDetailContent
      contentType="movie"
      contentId={resolvedId}
      contentTitle={title}
    />
  );
}

const styles = StyleSheet.create({
  invalidScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  invalidHeader: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
