import { Redirect } from 'expo-router';

/** Region now lives on the combined language and region screen. */
export default function RegionPreferenceScreen() {
  return <Redirect href="/profile/language" />;
}
