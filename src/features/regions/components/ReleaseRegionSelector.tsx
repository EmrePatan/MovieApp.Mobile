import { RegionSelector } from './RegionSelector';

interface ReleaseRegionSelectorProps {
  value: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (regionCode: string) => void;
}

export function ReleaseRegionSelector(props: ReleaseRegionSelectorProps) {
  return (
    <RegionSelector
      label="Release region"
      testID="release-region-selector"
      {...props}
    />
  );
}
