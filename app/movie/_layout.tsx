import { Stack } from 'expo-router';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';
import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';
import { colors } from '@/theme/colors';

export default function MovieDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="[id]/index" options={ratedDetailStackScreenOptions} />
      <Stack.Screen name="[id]/reviews" options={detailChildStackScreenOptions} />
      <Stack.Screen name="[id]/credits" options={detailChildStackScreenOptions} />
      <Stack.Screen name="[id]/gallery" options={detailChildStackScreenOptions} />
    </Stack>
  );
}
