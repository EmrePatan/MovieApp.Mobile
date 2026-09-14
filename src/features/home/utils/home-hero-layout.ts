export function getHomeHeroHeight(screenWidth: number): number {
  return Math.round(Math.min(520, Math.max(340, screenWidth * 0.68)));
}
