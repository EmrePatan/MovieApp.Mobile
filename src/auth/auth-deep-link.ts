import { extractTokenFromResetUrl } from '@/auth/reset-password-utils';
import { extractTokenFromVerificationUrl } from '@/auth/verify-email-utils';

export type AuthDeepLinkTarget =
  | { kind: 'verify-email'; token: string }
  | { kind: 'reset-password'; token: string };

export function parseAuthDeepLink(url: string | null | undefined): AuthDeepLinkTarget | null {
  const normalized = url?.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.includes('verify-email')) {
    const token = extractTokenFromVerificationUrl(normalized);
    if (token) {
      return { kind: 'verify-email', token };
    }
  }

  if (normalized.includes('reset-password')) {
    const token = extractTokenFromResetUrl(normalized);
    if (token) {
      return { kind: 'reset-password', token };
    }
  }

  return null;
}
