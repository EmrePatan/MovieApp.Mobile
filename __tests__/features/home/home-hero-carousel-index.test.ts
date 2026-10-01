import {
  getActiveIndexFromScrollIndex,
  getHeroCarouselActiveIndexFromOffset,
  HERO_CAROUSEL_LOOP_HEAD_INDEX,
  getScrollIndexFromOffset,
  resolveHeroCarouselLoopSettledOffset,
} from '@/features/home/utils/home-hero-carousel-index';

const SNAP = 358;
const COUNT = 3;

describe('home hero carousel index helpers', () => {
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
