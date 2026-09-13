import { AppText } from '@/components/common/AppText';

interface DetailMetadataRowProps {
  value: string;
}

export function DetailMetadataRow({ value }: DetailMetadataRowProps) {
  if (!value) {
    return null;
  }

  return (
    <AppText variant="caption" muted numberOfLines={2} accessibilityRole="text">
      {value}
    </AppText>
  );
}
