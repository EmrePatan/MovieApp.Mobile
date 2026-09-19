import { getUiFormatLocaleTag } from '@/i18n';
import { translateContentType } from '@/i18n/catalog-labels';

export function formatIsoDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(getUiFormatLocaleTag(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRuntimeMinutes(minutes: number | null | undefined): string | null {
  if (minutes == null || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function formatRating(value: number): string {
  return value > 0 ? value.toFixed(1) : '—';
}

export function formatContentType(type: 'movie' | 'tv' | 'person'): string {
  return translateContentType(type);
}

export function formatKnownForDepartment(
  department: string | null | undefined,
): string | null {
  if (!department || department.trim().length === 0) {
    return null;
  }

  return department.trim();
}

export function formatCatalogYear(
  releaseDate: string | null | undefined,
  year: number | null | undefined,
): string | null {
  if (year != null) {
    return String(year);
  }

  if (releaseDate) {
    return releaseDate.slice(0, 4);
  }

  return null;
}

export function formatVoteCount(count: number): string {
  if (count <= 0) {
    return '0';
  }

  return count.toLocaleString(getUiFormatLocaleTag());
}

export function shouldShowOriginalTitle(
  title: string,
  originalTitle: string | null | undefined,
): boolean {
  return Boolean(originalTitle && originalTitle.trim().length > 0 && originalTitle !== title);
}
