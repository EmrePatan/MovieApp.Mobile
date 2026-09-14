import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { useMovieCredits, useTvShowCredits } from '../hooks/useCredits';
import { CastRailItem } from './CastRailItem';
import { spacing } from '@/theme/spacing';

const MAX_CAST_ITEMS = 12;
const PORTRAIT_SIZE = 72;

interface CastRailProps {
  contentType: 'movie' | 'tv';
  contentId: string;
}

export function CastRail({ contentType, contentId }: CastRailProps) {
  const movieQuery = useMovieCredits(contentType === 'movie' ? contentId : '');
  const tvQuery = useTvShowCredits(contentType === 'tv' ? contentId : '');
  const query = contentType === 'movie' ? movieQuery : tvQuery;

  if (query.isLoading) {
    return (
      <View style={styles.container} testID="cast-rail-loading">
        <HomeSectionHeader title="Cast" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <View key={index} style={styles.skeletonItem}>
              <SkeletonBlock width={PORTRAIT_SIZE} height={PORTRAIT_SIZE} style={styles.skeletonPortrait} />
              <SkeletonBlock width={PORTRAIT_SIZE} height={12} />
              <SkeletonBlock width={PORTRAIT_SIZE * 0.8} height={10} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (query.isError || !query.data?.cast?.length) {
    return null;
  }

  const cast = query.data.cast.slice(0, MAX_CAST_ITEMS);

  return (
    <View style={styles.container} testID="cast-rail">
      <HomeSectionHeader title="Cast" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {cast.map((member, index) => (
          <CastRailItem
            key={`${member.providerPersonId ?? member.name}-${index}`}
            member={member}
            size={PORTRAIT_SIZE}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    flexDirection: 'row',
  },
  skeletonItem: {
    width: PORTRAIT_SIZE,
    alignItems: 'center',
    gap: spacing.xs,
  },
  skeletonPortrait: {
    borderRadius: PORTRAIT_SIZE / 2,
  },
});
