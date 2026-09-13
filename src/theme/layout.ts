import { spacing } from './spacing';

const posterCarousel = {
  width: 120,
  height: 180,
};

const homeSectionHeaderHeight = 26 + spacing.md;
const homeCardMetaHeight = spacing.sm + 40 + spacing.xs + 16;

export const layout = {
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.lg,
  sectionGap: spacing.lg,
  cardGap: spacing.sm,
  maxContentWidth: 480,
  touchTarget: 44,
  posterAspectRatio: 2 / 3,
  posterCarousel,
  posterList: {
    width: 72,
    height: 108,
  },
  avatarSm: 36,
  horizontalList: {
    initialNumToRender: 4,
    maxToRenderPerBatch: 4,
    windowSize: 5,
  },
  verticalList: {
    initialNumToRender: 3,
    maxToRenderPerBatch: 2,
    windowSize: 5,
  },
  detailHero: {
    minHeight: 220,
    maxHeight: 320,
    widthRatio: 0.52,
    posterOverlapRatio: 0.35,
  },
  homeSection: {
    headerHeight: homeSectionHeaderHeight,
    rowHeight:
      homeSectionHeaderHeight +
      posterCarousel.height +
      homeCardMetaHeight +
      spacing.lg,
    cardStride: posterCarousel.width + spacing.sm,
  },
} as const;
