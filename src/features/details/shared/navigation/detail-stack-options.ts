import type { NativeStackNavigationOptions } from 'expo-router';

/**
 * Movie and TV detail screens include a drag-based star rating control.
 * Native iOS interactive back swipe competes with that gesture, so it is
 * disabled here. Users can still navigate back via the overlay back button.
 */
export const ratedDetailStackScreenOptions: NativeStackNavigationOptions = {
  gestureEnabled: false,
};
