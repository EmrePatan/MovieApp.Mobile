/** `count` is the number of episodes marked, or null when only the server knows it. */
type HintListener = (count: number | null) => void;

const listeners = new Set<HintListener>();

/** Ask for the "manage your watch history" hint after several episodes were marked at once. */
export function requestWatchHistoryHint(count: number | null = null): void {
  listeners.forEach((listener) => listener(count));
}

export function subscribeWatchHistoryHint(listener: HintListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let holds = 0;
const holdListeners = new Set<() => void>();

/** Keep the hint back while something covers the screen. Returns the release function. */
export function holdWatchHistoryHint(): () => void {
  holds += 1;
  holdListeners.forEach((listener) => listener());
  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    holds -= 1;
    holdListeners.forEach((listener) => listener());
  };
}

export function isWatchHistoryHintHeld(): boolean {
  return holds > 0;
}

export function subscribeWatchHistoryHintHold(listener: () => void): () => void {
  holdListeners.add(listener);
  return () => {
    holdListeners.delete(listener);
  };
}
