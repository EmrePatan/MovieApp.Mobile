import { layout } from '@/theme/layout';

export function getHomeSectionRowLayout(_data: unknown, index: number) {
  return {
    length: layout.homeSection.rowHeight,
    offset: layout.homeSection.rowHeight * index,
    index,
  };
}

export function getHomeRailItemLayout(_data: unknown, index: number) {
  return {
    length: layout.homeSection.cardStride,
    offset: layout.homeSection.cardStride * index,
    index,
  };
}
