import {
  getActiveIndexFromScrollIndex,
  getHeroCarouselActiveIndexFromOffset,
  getHeroCarouselAutoplayScrollIndex,
  getHeroCarouselImagePriority,
  getHeroCarouselInitialMountedIndices,
  HERO_CAROUSEL_LOOP_HEAD_INDEX,
  HERO_CAROUSEL_RENDER_WINDOW,
  getScrollIndexFromOffset,
  resolveHeroCarouselLoopSettledOffset,
  shouldMountHeroSlide,
} from '@/features/home/utils/home-hero-carousel-index';

const SNAP = 358;
const COUNT = 3;

describe('home hero carousel index helpers', () => {
  it('puts the wrap-around left peek in the startup render window', () => {
    const loopLength = 10 + 2;
    expect(HERO_CAROUSEL_RENDER_WINDOW).toBe(3);
    expect(getHeroCarouselInitialMountedIndices(loopLength)).toEqual([0, 1, 2]);
    expect(getHeroCarouselInitialMountedIndices(loopLength)[0]).toBe(0);
    expect(shouldMountHeroSlide(0, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe(true);
    expect(shouldMountHeroSlide(1, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe(true);
    expect(shouldMountHeroSlide(2, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe(true);
    expect(shouldMountHeroSlide(3, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe(false);
    expect(shouldMountHeroSlide(loopLength - 1, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe(false);
    expect(getHeroCarouselImagePriority(0, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe('high');
    expect(getHeroCarouselImagePriority(2, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe('high');
    expect(getHeroCarouselImagePriority(HERO_CAROUSEL_LOOP_HEAD_INDEX, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe(
      'high',
    );
    expect(getHeroCarouselImagePriority(4, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe('low');
  });

  it('advances autoplay one slot forward and wraps through the trailing clone', () => {
    expect(getHeroCarouselAutoplayScrollIndex(0, 10)).toBe(2);
    expect(getHeroCarouselAutoplayScrollIndex(8, 10)).toBe(10);
    expect(getHeroCarouselAutoplayScrollIndex(9, 10)).toBe(11);
    expect(getHeroCarouselAutoplayScrollIndex(1, 2)).toBe(3);
    expect(getHeroCarouselAutoplayScrollIndex(0, 1)).toBe(0);
  });

  it('maps loop scroll indices to logical active indices', () => {
    expect(getActiveIndexFromScrollIndex(0, COUNT)).toBe(2);
    expect(getActiveIndexFromScrollIndex(HERO_CAROUSEL_LOOP_HEAD_INDEX, COUNT)).toBe(0);
    expect(getActiveIndexFromScrollIndex(2, COUNT)).toBe(1);
    expect(getActiveIndexFromScrollIndex(COUNT + 1, COUNT)).toBe(0);
  });

  it('keeps the current indicator below 50% drag progress', () => {
    const baseOffset = HERO_CAROUSEL_LOOP_HEAD_INDEX * SNAP;
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.49, SNAP, COUNT)).toBe(0);
  });

  it('switches indicator at or beyond 50% drag progress', () => {
    const baseOffset = HERO_CAROUSEL_LOOP_HEAD_INDEX * SNAP;
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.5, SNAP, COUNT)).toBe(1);
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.51, SNAP, COUNT)).toBe(1);
  });

  it('returns to the previous indicator when dragging back below 50%', () => {
    const baseOffset = HERO_CAROUSEL_LOOP_HEAD_INDEX * SNAP;
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.55, SNAP, COUNT)).toBe(1);
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.45, SNAP, COUNT)).toBe(0);
  });

  it('rewrites head clone offsets to the real last slide without changing active index', () => {
    const settled = resolveHeroCarouselLoopSettledOffset(0, SNAP, COUNT);

    expect(settled.activeIndex).toBe(COUNT - 1);
    expect(settled.settledOffsetX).toBe(COUNT * SNAP);
    expect(settled.needsScrollCorrection).toBe(true);
  });

  it('rewrites tail clone offsets to the real first slide without changing active index', () => {
    const cloneOffset = (COUNT + 1) * SNAP;
    const settled = resolveHeroCarouselLoopSettledOffset(cloneOffset, SNAP, COUNT);

    expect(settled.activeIndex).toBe(0);
    expect(settled.settledOffsetX).toBe(HERO_CAROUSEL_LOOP_HEAD_INDEX * SNAP);
    expect(settled.needsScrollCorrection).toBe(true);
  });

  it('maps offsets to physical scroll indices', () => {
    expect(getScrollIndexFromOffset(HERO_CAROUSEL_LOOP_HEAD_INDEX * SNAP, SNAP)).toBe(
      HERO_CAROUSEL_LOOP_HEAD_INDEX,
    );
    expect(getScrollIndexFromOffset(0, SNAP)).toBe(0);
    expect(getScrollIndexFromOffset((COUNT + 1) * SNAP, SNAP)).toBe(COUNT + 1);
  });

  it('keeps in-range offsets unchanged for normal A → B transitions', () => {
    const middleOffset = 2 * SNAP;
    const settled = resolveHeroCarouselLoopSettledOffset(middleOffset, SNAP, COUNT);

    expect(settled.activeIndex).toBe(1);
    expect(settled.settledOffsetX).toBe(middleOffset);
    expect(settled.needsScrollCorrection).toBe(false);
  });
});
