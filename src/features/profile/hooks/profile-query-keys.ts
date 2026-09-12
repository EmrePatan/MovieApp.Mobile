export function currentProfileQueryKey() {
  return ['profile', 'me'] as const;
}

export function profileStatisticsQueryKey() {
  return ['profile', 'statistics'] as const;
}
