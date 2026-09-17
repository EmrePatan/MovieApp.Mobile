import type { NativeStackNavigationOptions } from 'expo-router';

/**
 * Child destinations pushed from catalog detail (reviews, credits, gallery)
 * should keep edge-only iOS back gestures enabled.
 */
export const detailChildStackScreenOptions: NativeStackNavigationOptions = {
  gestureEnabled: true,
  fullScreenGestureEnabled: false,
};
