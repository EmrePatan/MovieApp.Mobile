import type { HomeItem, HomeSection } from '../types';

export function homeSectionKeyExtractor(section: HomeSection): string {
  return `${section.type}-${section.displayOrder}`;
}

export function homeItemKeyExtractor(item: HomeItem): string {
  return item.id;
}
