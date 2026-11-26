import { useContext } from 'react';
import { RegionalPreferenceContext } from '@/features/regions/RegionalPreferenceProvider';
import type { DetailExtras } from '../types/detail-extras';
import { resolveCertification } from '../utils/detail-facts';

/** The rating is optional decoration: without a known region the detail page shows none. */
export function useDetailCertification(extras: DetailExtras | null | undefined): string | null {
  const region = useContext(RegionalPreferenceContext)?.region;

  return region ? resolveCertification(extras, region) : null;
}
