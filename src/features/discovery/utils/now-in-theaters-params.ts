import { normalizeRegionCode } from '@/features/regions/region-options';
import {
  createDefaultNowInTheatersState,
  type NowInTheatersState,
} from '../now-in-theaters-types';

function readParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseNowInTheatersParams(
  params: Record<string, string | string[] | undefined>,
  defaultReleaseRegion?: string,
): NowInTheatersState {
  const defaults = createDefaultNowInTheatersState(defaultReleaseRegion);

  return {
    releaseRegion: normalizeRegionCode(readParam(params.releaseRegion) ?? defaults.releaseRegion),
  };
}

export function serializeNowInTheatersParams(
  state: NowInTheatersState,
): Record<string, string> {
  return {
    releaseRegion: state.releaseRegion,
  };
}

export function serializeNowInTheatersRoute(state: NowInTheatersState): string {
  const params = serializeNowInTheatersParams(state);
  const search = new URLSearchParams(params).toString();
  return search.length > 0 ? `/now-in-theaters?${search}` : '/now-in-theaters';
}

export function createNowInTheatersHref(
  overrides: Partial<NowInTheatersState> = {},
  defaultReleaseRegion?: string,
): string {
  const base = createDefaultNowInTheatersState(defaultReleaseRegion);

  return serializeNowInTheatersRoute({
    ...base,
    ...overrides,
  });
}
