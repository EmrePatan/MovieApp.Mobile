export function buildCurrentProfilePath(): string {
  return '/api/users/me';
}

export function buildUpdateProfilePath(): string {
  return '/api/users/me/profile';
}

export function buildChangeEmailPath(): string {
  return '/api/users/me/email';
}

export function buildChangePasswordPath(): string {
  return '/api/users/me/password';
}

export function buildProfileStatisticsPath(timeZone?: string): string {
  if (!timeZone) {
    return '/api/users/me/statistics';
  }

  const params = new URLSearchParams({ timeZone });
  return `/api/users/me/statistics?${params.toString()}`;
}

export function buildDeleteAccountPath(): string {
  return '/api/users/me';
}
