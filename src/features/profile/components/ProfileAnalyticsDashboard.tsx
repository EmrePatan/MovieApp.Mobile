import { StyleSheet, View } from 'react-native';
import type { UserStatisticsResponse } from '../types';
import { ProfileInsightStrip } from './ProfileInsightStrip';
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
      <ProfileInsightStrip insights={statistics.insights} />
      <ProfileYourYearSection activity={statistics.activity} />
      <ProfileTasteSection genres={statistics.genres} />
      <ProfileRatingsSection
        ratings={statistics.ratings}
        ratingsCount={statistics.summary.ratingsCount}
      />
      <ProfileWatchingDnaSection statistics={statistics} />
      <ProfileMilestonesSection milestones={statistics.milestones} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
});
