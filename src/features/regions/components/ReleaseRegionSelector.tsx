import { useTranslation } from 'react-i18next';
import { RegionSelector } from './RegionSelector';

interface ReleaseRegionSelectorProps {
  value: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (regionCode: string) => void;
}

export function ReleaseRegionSelector(props: ReleaseRegionSelectorProps) {
  const { t } = useTranslation();

  return (
    <RegionSelector
      label={t('discovery.releaseRegion')}
      testID="release-region-selector"
      {...props}
    />
  );
}
