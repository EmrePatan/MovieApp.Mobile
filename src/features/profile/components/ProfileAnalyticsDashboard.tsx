import { StyleSheet, View } from 'react-native';
import type { UserStatisticsResponse } from '../types';
import { ProfileHeroStats } from './ProfileHeroStats';
import { ProfileInsightStrip } from './ProfileInsightStrip';
import { ProfileLibrarySection } from './ProfileLibrarySection';
import { ProfileMilestonesSection } from './ProfileMilestonesSection';
import { ProfileRatingsSection } from './ProfileRatingsSection';
import { ProfileTasteSection } from './ProfileTasteSection';
import { ProfileWatchingDnaSection } from './ProfileWatchingDnaSection';
import { ProfileYourYearSection } from './ProfileYourYearSection';
import { spacing } from '@/theme/spacing';

interface ProfileAnalyticsDashboardProps {
  statistics: UserStatisticsResponse;
}

export function ProfileAnalyticsDashboard({ statistics }: ProfileAnalyticsDashboardProps) {
  return (
    <View style={styles.container}>
      <ProfileHeroStats summary={statistics.summary} />
      <ProfileInsightStrip insights={statistics.insights} />
      <ProfileYourYearSection activity={statistics.activity} />
      <ProfileTasteSection genres={statistics.genres} />
      <ProfileRatingsSection
        ratings={statistics.ratings}
        ratingsCount={statistics.summary.ratingsCount}
      />
      <ProfileWatchingDnaSection statistics={statistics} />
      <ProfileMilestonesSection milestones={statistics.milestones} />
      <ProfileLibrarySection summary={statistics.summary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
});
