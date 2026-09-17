import { Stack } from 'expo-router';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';

export default function GalleryLayout() {
  return <Stack screenOptions={{ headerShown: false, ...detailChildStackScreenOptions }} />;
}
