import { Stack } from 'expo-router';
import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';
import { colors } from '@/theme/colors';

export default function MovieDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        ...ratedDetailStackScreenOptions,
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
