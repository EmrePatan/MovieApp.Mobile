import type { CatalogKeywordSummary } from '../types/catalog-keyword';

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isGuidString(value: string): boolean {
  return GUID_PATTERN.test(value.trim());
}

function readKeywordId(record: Record<string, unknown>): string | null {
  const raw = record.id ?? record.Id;
  if (!isNonEmptyString(raw)) {
    return null;
  }

  const id = raw.trim();
  return isGuidString(id) ? id : null;
}

function readKeywordName(record: Record<string, unknown>): string | null {
  const raw = record.name ?? record.Name;
  return isNonEmptyString(raw) ? raw.trim() : null;
}

/**
 * Normalizes movie/TV detail `keywords` from API into a single rail shape.
 * Legacy production: string[]. New contract: { id, name }[].
 */
export function normalizeDetailKeywords(raw: unknown): CatalogKeywordSummary[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  const normalized: CatalogKeywordSummary[] = [];

  for (const entry of raw) {
    if (isNonEmptyString(entry)) {
      normalized.push({ id: null, name: entry.trim() });
      continue;
    }

    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const record = entry as Record<string, unknown>;
    const name = readKeywordName(record);
    if (!name) {
      continue;
    }

    normalized.push({
      id: readKeywordId(record),
      name,
    });
  }

  return normalized;
}

export function isDiscoverableDetailKeyword(
  keyword: CatalogKeywordSummary | null | undefined,
): boolean {
  if (!keyword) {
    return false;
  }

  return keyword.id != null && keyword.id.length > 0;
}
