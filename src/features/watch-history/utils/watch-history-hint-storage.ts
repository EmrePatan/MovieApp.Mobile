import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'movieapp.watch-history-hint';
export const WATCH_HISTORY_HINT_MAX_SHOWS = 3;

interface HintState {
  /** The user opened the history from the hint, or edited dates there. */
  learned: boolean;
  shownCount: number;
  /** Local calendar day of the last show. */
  lastShownDay: string | null;
}

const INITIAL_STATE: HintState = { learned: false, shownCount: 0, lastShownDay: null };

async function readState(): Promise<HintState> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? { ...INITIAL_STATE, ...(JSON.parse(stored) as Partial<HintState>) } : INITIAL_STATE;
}

function writeState(state: HintState): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Counts one show and returns true when the hint may appear now: not learned yet,
 * under the total limit and not already shown today. Stays quiet if storage fails.
 */
export async function claimWatchHistoryHintShow(now = new Date()): Promise<boolean> {
  try {
    const state = await readState();
    const today = now.toDateString();
    if (
      state.learned ||
      state.shownCount >= WATCH_HISTORY_HINT_MAX_SHOWS ||
      state.lastShownDay === today
    ) {
      return false;
    }

    await writeState({ ...state, shownCount: state.shownCount + 1, lastShownDay: today });
    return true;
  } catch {
    return false;
  }
}

export async function markWatchHistoryHintLearned(): Promise<void> {
  try {
    await writeState({ ...(await readState()), learned: true });
  } catch {
    // The hint may then show again, still within its limits.
  }
}
