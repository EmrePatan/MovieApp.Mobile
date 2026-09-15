import type { AdvancedDiscoverMediaType, AdvancedDiscoverSort } from '../advanced-discover-types';
import {
  createDefaultWorldCinemaState,
  DEFAULT_WORLD_CINEMA_SORT,
  type WorldCinemaState,
} from '../world-cinema-types';

function readParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseMediaType(value: string | undefined): AdvancedDiscoverMediaType {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'tv' ? 'tv' : 'movie';
}

function parseOriginCountry(value: string | undefined): string {
  const trimmed = value?.trim().toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : createDefaultWorldCinemaState().originCountry;
}

function parseSort(value: string | undefined): AdvancedDiscoverSort {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case 'rating_desc':
    case 'newest':
    case 'oldest':
      return normalized;
    default:
      return DEFAULT_WORLD_CINEMA_SORT;
  }
}

export function parseWorldCinemaParams(
  params: Record<string, string | string[] | undefined>,
): WorldCinemaState {
  const defaults = createDefaultWorldCinemaState();

  return {
    mediaType: parseMediaType(readParam(params.mediaType) ?? defaults.mediaType),
    originCountry: parseOriginCountry(readParam(params.originCountry) ?? defaults.originCountry),
    sort: parseSort(readParam(params.sort) ?? defaults.sort),
  };
}

export function serializeWorldCinemaParams(
  state: WorldCinemaState,
): Record<string, string> {
  const params: Record<string, string> = {
    mediaType: state.mediaType,
    originCountry: state.originCountry,
  };

  if (state.sort !== DEFAULT_WORLD_CINEMA_SORT) {
    params.sort = state.sort;
  }

  return params;
}

export function serializeWorldCinemaRoute(state: WorldCinemaState): string {
  const params = serializeWorldCinemaParams(state);
  const search = new URLSearchParams(params).toString();
  return search.length > 0 ? `/world-cinema?${search}` : '/world-cinema';
}

export function createWorldCinemaHref(
  overrides: Partial<WorldCinemaState> = {},
): string {
  const base = createDefaultWorldCinemaState();

  return serializeWorldCinemaRoute({
    ...base,
    ...overrides,
  });
}
