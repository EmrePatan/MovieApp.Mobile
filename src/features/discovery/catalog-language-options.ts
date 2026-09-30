export interface CatalogLanguageOption {
  code: string;
  labelKey: string;
}

/** Curated original-language options for filter selectors (ISO 639-1). */
export const CATALOG_LANGUAGE_OPTIONS: readonly CatalogLanguageOption[] = [
  { code: 'en', labelKey: 'en' },
  { code: 'tr', labelKey: 'tr' },
  { code: 'es', labelKey: 'es' },
  { code: 'fr', labelKey: 'fr' },
  { code: 'de', labelKey: 'de' },
  { code: 'it', labelKey: 'it' },
  { code: 'pt', labelKey: 'pt' },
  { code: 'ja', labelKey: 'ja' },
  { code: 'ko', labelKey: 'ko' },
  { code: 'zh', labelKey: 'zh' },
  { code: 'hi', labelKey: 'hi' },
  { code: 'ar', labelKey: 'ar' },
] as const;
