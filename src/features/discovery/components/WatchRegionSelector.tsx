import { useTranslation } from 'react-i18next';
import { RegionSelector } from '@/features/regions/components/RegionSelector';

interface WatchRegionSelectorProps {
  value: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (regionCode: string) => void;
}

export function WatchRegionSelector(props: WatchRegionSelectorProps) {
  const { t } = useTranslation();

  return (
    <RegionSelector
      label={t('discovery.streamingDiscover.watchRegion')}
      testID="watch-region-selector"
      {...props}
    />
  );
}
