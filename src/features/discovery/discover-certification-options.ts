export interface DiscoverCertificationOption {
  value: string;
  label: string;
}

const US_CERTIFICATIONS: DiscoverCertificationOption[] = [
  { value: 'G', label: 'G' },
  { value: 'PG', label: 'PG' },
  { value: 'PG-13', label: 'PG-13' },
  { value: 'R', label: 'R' },
  { value: 'NC-17', label: 'NC-17' },
];

const GB_CERTIFICATIONS: DiscoverCertificationOption[] = [
  { value: 'U', label: 'U' },
  { value: 'PG', label: 'PG' },
  { value: '12A', label: '12A' },
  { value: '12', label: '12' },
  { value: '15', label: '15' },
  { value: '18', label: '18' },
];

const DE_CERTIFICATIONS: DiscoverCertificationOption[] = [
  { value: '0', label: '0' },
  { value: '6', label: '6' },
  { value: '12', label: '12' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
];

const FR_CERTIFICATIONS: DiscoverCertificationOption[] = [
  { value: 'TP', label: 'TP' },
  { value: '12', label: '12' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
];

const TR_CERTIFICATIONS: DiscoverCertificationOption[] = [
  { value: 'Genel İzleyici', label: 'Genel' },
  { value: '7+', label: '7+' },
  { value: '13+', label: '13+' },
  { value: '15+', label: '15+' },
  { value: '18+', label: '18+' },
];

const CERTIFICATIONS_BY_COUNTRY: Record<string, DiscoverCertificationOption[]> = {
  US: US_CERTIFICATIONS,
  GB: GB_CERTIFICATIONS,
  DE: DE_CERTIFICATIONS,
  FR: FR_CERTIFICATIONS,
  TR: TR_CERTIFICATIONS,
};

export function listCertificationOptions(countryCode: string): DiscoverCertificationOption[] {
  const normalized = countryCode.trim().toUpperCase();
  return CERTIFICATIONS_BY_COUNTRY[normalized] ?? [];
}

export function isSupportedCertificationCountry(countryCode: string): boolean {
  const normalized = countryCode.trim().toUpperCase();
  return normalized in CERTIFICATIONS_BY_COUNTRY;
}
