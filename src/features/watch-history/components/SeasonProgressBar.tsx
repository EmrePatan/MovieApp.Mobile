import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';
import {
  calculateSeasonProgressPercentage,
  getSeasonProgressState,
  normalizeProgressCounts,
} from '../utils/season-progress';

interface SeasonProgressBarProps {
  watchedEpisodes: number;
  totalEpisodes: number;
  testID?: string;
}

export function SeasonProgressBar({
  watchedEpisodes,
  totalEpisodes,
  testID = 'season-progress-bar',
}: SeasonProgressBarProps) {
  const { watchedEpisodes: watched, totalEpisodes: total } = normalizeProgressCounts(
    watchedEpisodes,
    totalEpisodes,
  );
  const state = getSeasonProgressState(watched, total);
  const progressPercent = calculateSeasonProgressPercentage(watched, total);
  const fillColor =
    state === 'completed'
      ? colors.progressCompleted
      : state === 'in-progress'
        ? colors.progressInProgress
        : colors.progressTrack;

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
      testID={testID}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${progressPercent}%`,
            backgroundColor: fillColor,
          },
        ]}
        testID={`${testID}-fill`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
