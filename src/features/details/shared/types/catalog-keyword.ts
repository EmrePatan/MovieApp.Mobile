/** Normalized detail keyword for the two-row rail (post-`normalizeDetailKeywords`). */
export interface CatalogKeywordSummary {
  /** Catalog keyword Guid when API provides it; null for legacy string-only payloads. */
  id: string | null;
  name: string;
}

/** Raw `keywords` field from detail API (legacy or current contract). */
export type DetailKeywordsApiPayload = unknown;
