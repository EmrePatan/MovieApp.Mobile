export function getHomeHeroHeight(screenWidth: number): number {
  return Math.round(Math.min(480, Math.max(310, screenWidth * 0.64)));
}
