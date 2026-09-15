import { RegionSelector } from '@/features/regions/components/RegionSelector';

interface WatchRegionSelectorProps {
  value: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (regionCode: string) => void;
}

export function WatchRegionSelector(props: WatchRegionSelectorProps) {
  return (
    <RegionSelector
      label="Watch region"
      testID="watch-region-selector"
      {...props}
    />
  );
}
