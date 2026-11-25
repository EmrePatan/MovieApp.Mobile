import { Redirect } from 'expo-router';

/** Legacy route — social inbox now lives under the unified notifications screen. */
export default function SocialNotificationsRedirect() {
  return <Redirect href="/notifications?tab=social" />;
}
