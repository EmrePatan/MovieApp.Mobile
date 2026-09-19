export function parseVerifyEmailTokenParam(
  tokenParam: string | string[] | undefined,
): string {
  if (Array.isArray(tokenParam)) {
    return tokenParam[0]?.trim() ?? '';
  }

  return tokenParam?.trim() ?? '';
}

export function extractTokenFromVerificationUrl(url: string): string | null {
  if (!url) {
    return null;
  }

  const queryIndex = url.indexOf('?');
  if (queryIndex < 0) {
    return null;
  }

  const query = url.slice(queryIndex + 1);
  for (const part of query.split('&')) {
    if (!part) {
      continue;
    }

    const [key, value] = part.split('=');
    if (key?.toLowerCase() === 'token' && value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}
