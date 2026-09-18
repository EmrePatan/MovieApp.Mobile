import type { NativeStackNavigationOptions } from 'expo-router';

/**
 * Movie and TV catalog stacks include a drag-based star rating control.
 * Keep iOS edge back-swipe enabled, but restrict it to the screen edge so
 * horizontal rating drags do not compete with full-screen back gestures.
 * Applied on the root app stack `movie` / `tv` screens, the nested catalog
 * layouts, and the detail index screen. While the user is actively rating,
 * DetailQueryState temporarily disables back-swipe across the navigator chain.
 */
export const ratedDetailStackScreenOptions: NativeStackNavigationOptions = {
  gestureEnabled: true,
  fullScreenGestureEnabled: false,
};
