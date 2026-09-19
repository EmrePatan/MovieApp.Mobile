import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { colors } from '@/theme/colors';

const TRIGGER_DISTANCE = 72;

interface AndroidPullToRefreshHeaderProps {
  pullDistance: SharedValue<number>;
  refreshing: boolean;
}

export function AndroidPullToRefreshHeader({
  pullDistance,
  refreshing,
}: AndroidPullToRefreshHeaderProps) {
  const containerStyle = useAnimatedStyle(() => ({
    height: refreshing ? 40 : Math.max(pullDistance.value * 0.65, 0),
    opacity: refreshing ? 1 : Math.min(pullDistance.value / TRIGGER_DISTANCE, 1),
  }));

  return (
    <Animated.View
      testID="android-pull-refresh-header"
      style={[styles.container, containerStyle]}
    >
      <View testID="android-pull-refresh-indicator">
        <ActivityIndicator color={colors.accent} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
