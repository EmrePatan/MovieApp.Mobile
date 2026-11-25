import { resolveThreadMediaFrame } from '@/features/social/utils/resolve-thread-media-frame';

describe('resolveThreadMediaFrame', () => {
  it('keeps landscape within max width', () => {
    const frame = resolveThreadMediaFrame(16 / 9, 280, 320);
    expect(frame.width).toBe(280);
    expect(frame.height).toBeLessThanOrEqual(320);
  });

  it('clamps tall portrait to max height', () => {
    const frame = resolveThreadMediaFrame(9 / 16, 280, 320);
    expect(frame.height).toBe(320);
    expect(frame.width).toBeLessThanOrEqual(280);
  });

  it('falls back for invalid aspect', () => {
    const frame = resolveThreadMediaFrame(0);
    expect(frame.width).toBeGreaterThan(0);
    expect(frame.height).toBeGreaterThan(0);
  });
});
