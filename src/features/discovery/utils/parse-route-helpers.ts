export function readRouteParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseCommaSeparatedIds(
  value: string | string[] | undefined,
): string[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const ids = rawValues
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return Array.from(new Set(ids));
}

export function parseYearParam(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1888 || parsed > 2100) {
    return null;
  }

  return parsed;
}

export function parseRatingParam(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    return null;
  }

  return parsed;
}

export function parseVoteCountParam(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function parseRuntimeParam(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function parseLanguageCodeParam(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseOriginCountryParam(
  value: string | undefined,
  fallback: string | null = null,
): string | null {
  const trimmed = value?.trim().toUpperCase() ?? '';
  if (/^[A-Z]{2}$/.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}
