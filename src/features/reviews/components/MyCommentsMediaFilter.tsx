import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedPillTabs } from '@/components/common/SegmentedPillTabs';
import type { CatalogMediaFilter } from '@/features/library/types';

const FILTER_VALUES: CatalogMediaFilter[] = ['all', 'movie', 'tv'];

interface MyCommentsMediaFilterProps {
  value: CatalogMediaFilter;
  onChange: (value: CatalogMediaFilter) => void;
}

export function MyCommentsMediaFilter({ value, onChange }: MyCommentsMediaFilterProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () =>
      FILTER_VALUES.map((filterValue) => {
        const label = t(`profile.myComments.filters.${filterValue}`);
        return {
          value: filterValue,
          label,
          accessibilityLabel: t('common.filterLabel', { label }),
        };
      }),
    [t],
  );

  return <SegmentedPillTabs options={options} value={value} onChange={onChange} />;
}
