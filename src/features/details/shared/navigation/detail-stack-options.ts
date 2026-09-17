import type { NativeStackNavigationOptions } from 'expo-router';

/**
 * Movie and TV detail screens include a drag-based star rating control.
 * Keep iOS edge back-swipe enabled, but restrict it to the screen edge so
 * horizontal rating drags do not compete with full-screen back gestures.
 * While the user is actively rating, DetailQueryState temporarily disables
 * the parent root-stack back-swipe via navigation.setOptions.
 */
export const ratedDetailStackScreenOptions: NativeStackNavigationOptions = {
  gestureEnabled: true,
  fullScreenGestureEnabled: false,
};
