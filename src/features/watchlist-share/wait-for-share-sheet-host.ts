import { InteractionManager } from 'react-native';

const DEFAULT_MODAL_DISMISS_MS = 450;

/** Wait for the list options bottom sheet modal to finish closing before Alert / Share. */
export function waitForShareSheetHost(delayMs = DEFAULT_MODAL_DISMISS_MS): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(resolve, delayMs);
    });
  });
}
