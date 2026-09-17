import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { openCreditsDetail } from '@/features/details/shared/navigation/credits-detail-navigation';
import { openPersonDetail } from '@/features/details/shared/navigation/person-detail-navigation';
import { buildCreditsRoute } from '@/features/details/shared/routes';
import { useMovieCredits, useTvShowCredits } from '../hooks/useCredits';
import type { CastMember } from '../types';
import { CastRailItem } from './CastRailItem';
import { spacing } from '@/theme/spacing';

const MAX_CAST_ITEMS = 8;
const PORTRAIT_SIZE = 72;
const SECTION_TITLE = 'Cast & Crew';

interface CastRailProps {
  contentType: 'movie' | 'tv';
  contentId: string;
  title?: string;
}

export function CastRail({ contentType, contentId, title }: CastRailProps) {
  const router = useRouter();
  const movieQuery = useMovieCredits(contentType === 'movie' ? contentId : '');
  const tvQuery = useTvShowCredits(contentType === 'tv' ? contentId : '');
  const query = contentType === 'movie' ? movieQuery : tvQuery;

  const handleCastPress = useCallback(
    (member: CastMember) => {
      if (member.providerPersonId == null) {
        return;
      }

      openPersonDetail(router, member.providerPersonId);
    },
    [contentId, contentType, router],
  );

  const handleSeeAllPress = useCallback(() => {
    openCreditsDetail(router, buildCreditsRoute(contentType, contentId, { title }));
  }, [contentId, contentType, router, title]);

  if (query.isLoading) {
    return (
      <View style={styles.container} testID="cast-rail-loading">
        <HomeSectionHeader title={SECTION_TITLE} />
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

  if (query.isError || !query.data) {
    return null;
  }

  const cast = query.data.cast ?? [];
  const crew = query.data.crew ?? [];
  const hasCast = cast.length > 0;
  const hasCrew = crew.length > 0;
  const showSeeAll = cast.length > MAX_CAST_ITEMS || hasCrew;

  if (!hasCast && !hasCrew) {
    return null;
  }

  const previewCast = cast.slice(0, MAX_CAST_ITEMS);

  return (
    <View
      style={styles.container}
      testID={hasCast ? 'cast-rail' : 'cast-rail-crew-only'}
    >
      <HomeSectionHeader
        title={SECTION_TITLE}
        onSeeAllPress={showSeeAll ? handleSeeAllPress : undefined}
      />
      {hasCast ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {previewCast.map((member, index) => (
            <CastRailItem
              key={`${member.providerPersonId ?? member.name}-${index}`}
              member={member}
              size={PORTRAIT_SIZE}
              onPress={handleCastPress}
            />
          ))}
        </ScrollView>
      ) : null}
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
