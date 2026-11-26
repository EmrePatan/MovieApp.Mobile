import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import {
  WATCH_HISTORY_HINT_DURATION_MS,
  WatchHistoryHint,
} from '@/features/watch-history/components/WatchHistoryHint';
import {
  holdWatchHistoryHint,
  requestWatchHistoryHint,
} from '@/features/watch-history/utils/watch-history-hint-requests';
import {
  claimWatchHistoryHintShow,
  markWatchHistoryHintLearned,
} from '@/features/watch-history/utils/watch-history-hint-storage';

const mockPush = jest.fn();

// The shared setup runs effects immediately and drops their cleanups; the timer needs real ones.
jest.unmock('react');
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const day = (number: number) => new Date(2026, 10, number, 12);

describe('watch history hint', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    await AsyncStorage.clear();
  });

  afterEach(() => jest.useRealTimers());

  it('shows once a day and at most three times', async () => {
    expect(await claimWatchHistoryHintShow(day(1))).toBe(true);
    expect(await claimWatchHistoryHintShow(day(1))).toBe(false);
    expect(await claimWatchHistoryHintShow(day(2))).toBe(true);
    expect(await claimWatchHistoryHintShow(day(3))).toBe(true);
    expect(await claimWatchHistoryHintShow(day(4))).toBe(false);
  });

  it('never shows again once the user knows the way', async () => {
    await markWatchHistoryHintLearned();

    expect(await claimWatchHistoryHintShow(day(1))).toBe(false);
  });

  it('leaves by itself', async () => {
    jest.useFakeTimers();
    render(<WatchHistoryHint />);

    await act(async () => requestWatchHistoryHint(8));
    expect(screen.getByTestId('watch-history-hint')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(WATCH_HISTORY_HINT_DURATION_MS);
    });
    expect(screen.queryByTestId('watch-history-hint')).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('waits for covering modals and counts the show only then', async () => {
    const closeConfetti = holdWatchHistoryHint();
    render(<WatchHistoryHint />);
    await act(async () => requestWatchHistoryHint(8));

    // The rating sheet takes over from the confetti in the same commit.
    let closeRatingSheet = () => {};
    await act(async () => {
      closeConfetti();
      closeRatingSheet = holdWatchHistoryHint();
    });
    expect(screen.queryByTestId('watch-history-hint')).toBeNull();

    await act(async () => closeRatingSheet());
    expect(screen.getByTestId('watch-history-hint')).toBeTruthy();
  });

  it('comes back in full when covered while on screen, without a second count', async () => {
    jest.useFakeTimers();
    render(<WatchHistoryHint />);
    await act(async () => requestWatchHistoryHint(8));
    expect(screen.getByTestId('watch-history-hint')).toBeTruthy();

    let uncover = () => {};
    await act(async () => {
      uncover = holdWatchHistoryHint();
    });
    expect(screen.queryByTestId('watch-history-hint')).toBeNull();
    act(() => {
      jest.advanceTimersByTime(WATCH_HISTORY_HINT_DURATION_MS * 2);
    });
    expect(screen.queryByTestId('watch-history-hint')).toBeNull();

    await act(async () => uncover());
    expect(screen.getByTestId('watch-history-hint')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(WATCH_HISTORY_HINT_DURATION_MS);
    });
    expect(screen.queryByTestId('watch-history-hint')).toBeNull();
  });

  it('opens the watch history and is learned from then on', async () => {
    render(<WatchHistoryHint />);
    await act(async () => requestWatchHistoryHint());

    await act(async () => {
      fireEvent.press(screen.getByTestId('watch-history-hint'));
    });

    expect(mockPush).toHaveBeenCalledWith('/watch-history');
    expect(screen.queryByTestId('watch-history-hint')).toBeNull();
    expect(await claimWatchHistoryHintShow(day(1))).toBe(false);
  });
});
