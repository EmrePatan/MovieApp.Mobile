import type { ProfileSocialLinks, ProfileSocialPlatform } from '../types';

export const PROFILE_SOCIAL_PLATFORMS: readonly ProfileSocialPlatform[] = [
  'x',
  'instagram',
  'snapchat',
  'tiktok',
  'youtube',
  'twitch',
  'threads',
  'website',
] as const;

const HANDLE_MAX = 64;
const WEBSITE_MAX = 200;

const PROFILE_URL_PREFIX: Record<Exclude<ProfileSocialPlatform, 'website'>, string> = {
  x: 'https://x.com/',
  instagram: 'https://instagram.com/',
  snapchat: 'https://www.snapchat.com/add/',
  tiktok: 'https://www.tiktok.com/@',
  youtube: 'https://www.youtube.com/@',
  twitch: 'https://www.twitch.tv/',
  threads: 'https://www.threads.net/@',
};

export function emptySocialLinks(): ProfileSocialLinks {
  return {
    x: null,
    instagram: null,
    snapchat: null,
    tiktok: null,
    youtube: null,
    twitch: null,
    threads: null,
    website: null,
  };
}

/** Strip @ and common profile URL prefixes → bare handle. */
export function normalizeSocialHandle(platform: ProfileSocialPlatform, raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (platform === 'website') {
    return normalizeWebsite(trimmed);
  }

  let value = trimmed;
  if (value.startsWith('@')) {
    value = value.slice(1);
  }

  const prefix = PROFILE_URL_PREFIX[platform];
  const lower = value.toLowerCase();
  const prefixLower = prefix.toLowerCase();
  if (lower.startsWith(prefixLower)) {
    value = value.slice(prefix.length);
  } else if (platform === 'x' && lower.startsWith('https://twitter.com/')) {
    value = value.slice('https://twitter.com/'.length);
  } else if (platform === 'x' && lower.startsWith('http://twitter.com/')) {
    value = value.slice('http://twitter.com/'.length);
  }

  value = value.split(/[/?#]/)[0]?.trim() ?? '';
  if (!value) return null;
  return value.slice(0, HANDLE_MAX);
}

function normalizeWebsite(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString().slice(0, WEBSITE_MAX);
  } catch {
    return null;
  }
}

export function buildSocialLinkUrl(platform: ProfileSocialPlatform, value: string): string | null {
  const normalized = normalizeSocialHandle(platform, value);
  if (!normalized) return null;
  if (platform === 'website') return normalized;
  return `${PROFILE_URL_PREFIX[platform]}${normalized}`;
}

export function filledSocialLinks(
  links: ProfileSocialLinks | null | undefined,
): Array<{ platform: ProfileSocialPlatform; value: string; url: string }> {
  if (!links) return [];
  const out: Array<{ platform: ProfileSocialPlatform; value: string; url: string }> = [];
  for (const platform of PROFILE_SOCIAL_PLATFORMS) {
    const raw = links[platform];
    if (raw == null || !String(raw).trim()) continue;
    const url = buildSocialLinkUrl(platform, String(raw));
    if (!url) continue;
    const value = normalizeSocialHandle(platform, String(raw)) ?? String(raw).trim();
    out.push({ platform, value, url });
  }
  return out;
}

/** Draft form → API payload (null clears). */
export function serializeSocialLinksForUpdate(
  draft: Record<ProfileSocialPlatform, string>,
): ProfileSocialLinks {
  const result: ProfileSocialLinks = {};
  for (const platform of PROFILE_SOCIAL_PLATFORMS) {
    const normalized = normalizeSocialHandle(platform, draft[platform] ?? '');
    result[platform] = normalized;
  }
  return result;
}

export function socialLinksToDraft(
  links: ProfileSocialLinks | null | undefined,
): Record<ProfileSocialPlatform, string> {
  const draft = {} as Record<ProfileSocialPlatform, string>;
  for (const platform of PROFILE_SOCIAL_PLATFORMS) {
    const value = links?.[platform];
    if (value == null || !String(value).trim()) {
      draft[platform] = '';
      continue;
    }
    if (platform === 'website') {
      draft[platform] = String(value).trim();
    } else {
      const handle = normalizeSocialHandle(platform, String(value));
      draft[platform] = handle ? `@${handle}` : '';
    }
  }
  return draft;
}

export function isValidSocialDraftValue(platform: ProfileSocialPlatform, raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (platform === 'website') {
    return normalizeWebsite(trimmed) != null;
  }
  const handle = normalizeSocialHandle(platform, trimmed);
  return handle != null && handle.length > 0 && handle.length <= HANDLE_MAX;
}

export const PROFILE_BIO_MAX = 300;
