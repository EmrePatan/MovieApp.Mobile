/** RN bottom-sheet modal slide animation is ~300ms; brief buffer avoids Share.share being swallowed. */
const DEFAULT_MODAL_DISMISS_MS = 280;

export function waitForShareSheetHost(delayMs = DEFAULT_MODAL_DISMISS_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}
