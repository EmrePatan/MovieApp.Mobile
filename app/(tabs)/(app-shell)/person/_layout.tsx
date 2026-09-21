import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function PersonLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="[tmdbId]" />
    </Stack>
  );
}
