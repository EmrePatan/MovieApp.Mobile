import { getDetailReviewPreviewCardDimensions } from '@/features/reviews/utils/detail-review-preview-layout';

describe('getDetailReviewPreviewCardDimensions', () => {
  it('keeps card dimensions within the detail preview range', () => {
    const phone = getDetailReviewPreviewCardDimensions(390);
    expect(phone.width).toBeGreaterThanOrEqual(280);
    expect(phone.width).toBeLessThanOrEqual(320);
    expect(phone.height).toBeGreaterThanOrEqual(140);
    expect(phone.height).toBeLessThanOrEqual(160);

    const tablet = getDetailReviewPreviewCardDimensions(900);
    expect(tablet.width).toBe(320);
    expect(tablet.height).toBeLessThanOrEqual(160);
  });
});
