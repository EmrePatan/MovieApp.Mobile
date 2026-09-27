export const HOME_HEADER_BAR_HEIGHT = 54;

const BASELINE_HEADER_HEIGHT = 45;

export function getHomeHeaderBarHeight(): number {
  return HOME_HEADER_BAR_HEIGHT;
}

export function getHomeHeaderHeroOffsetCompensation(barHeight: number): number {
  return Math.max(0, barHeight - BASELINE_HEADER_HEIGHT);
}

export function getHomeHeaderLayout(screenWidth: number) {
  const barHeight = getHomeHeaderBarHeight();

  return {
    barHeight,
    heroOffsetCompensation: getHomeHeaderHeroOffsetCompensation(barHeight),
    screenWidth,
  };
}

export type HomeHeaderLayout = ReturnType<typeof getHomeHeaderLayout>;
