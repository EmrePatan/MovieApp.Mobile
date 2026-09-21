import { Stack } from 'expo-router';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';

export default function PersonDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="filmography" />
      <Stack.Screen name="gallery" options={detailChildStackScreenOptions} />
    </Stack>
  );
}
