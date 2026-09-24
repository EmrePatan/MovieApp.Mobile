export function shouldTriggerShowCompletionCelebration(
  previousCompleted: boolean | null,
  isCompleted: boolean,
): boolean {
  if (previousCompleted === null) {
    return false;
  }

  return !previousCompleted && isCompleted;
}
