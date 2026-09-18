import { Stack } from 'expo-router';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';
import { colors } from '@/theme/colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        ...detailChildStackScreenOptions,
      }}
    />
  );
}
