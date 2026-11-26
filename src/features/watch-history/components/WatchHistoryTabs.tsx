import { useTranslation } from 'react-i18next';
import { SegmentedPillTabs } from '@/components/common/SegmentedPillTabs';

interface WatchHistoryTabsProps {
  undated: boolean;
  onChange: (undated: boolean) => void;
}

export function WatchHistoryTabs({ undated, onChange }: WatchHistoryTabsProps) {
  const { t } = useTranslation();

  return (
    <SegmentedPillTabs
      options={[
        {
          value: 'dated',
          label: t('extras.historyDatesTabDated'),
          testID: 'watch-history-tab-dated',
        },
        {
          value: 'undated',
          label: t('extras.historyDatesUnknownSection'),
          testID: 'watch-history-tab-undated',
        },
      ]}
      value={undated ? 'undated' : 'dated'}
      onChange={(value) => onChange(value === 'undated')}
    />
  );
}
