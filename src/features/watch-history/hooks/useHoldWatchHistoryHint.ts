import { useEffect } from 'react';
import { holdWatchHistoryHint } from '../utils/watch-history-hint-requests';

/** Keeps the watch history hint back while `active`, for example while a modal is open. */
export function useHoldWatchHistoryHint(active: boolean): void {
  useEffect(() => (active ? holdWatchHistoryHint() : undefined), [active]);
}
