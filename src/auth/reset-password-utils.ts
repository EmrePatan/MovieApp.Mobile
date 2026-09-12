export function parseResetPasswordTokenParam(
  token: string | string[] | undefined,
): string {
  const rawValue = Array.isArray(token) ? token[0] ?? '' : token ?? '';
  return rawValue.trim();
}

export function extractTokenFromResetUrl(resetUrl: string): string | null {
  const queryIndex = resetUrl.indexOf('?');
  if (queryIndex < 0) {
    return null;
  }

  const query = resetUrl.slice(queryIndex + 1);
  for (const part of query.split('&')) {
    if (!part) {
      continue;
    }

    const [key, value = ''] = part.split('=');
    if (key?.toLowerCase() === 'token' && value) {
      return decodeURIComponent(value.replace(/\+/g, '%20'));
    }
  }

  return null;
}
