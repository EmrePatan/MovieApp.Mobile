import {
  formatReviewDateLabel,
  getAuthorInitials,
} from '@/features/reviews/utils/review-format';

describe('review format utilities', () => {
  it('derives author initials', () => {
    expect(getAuthorInitials('Jane Doe')).toBe('JD');
    expect(getAuthorInitials('Madonna')).toBe('MA');
    expect(getAuthorInitials('  ')).toBe('?');
  });

  it('shows edited label when updatedAt differs', () => {
    const label = formatReviewDateLabel('2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z');
    expect(label).toContain('edited');
  });

  it('hides edited label when dates match', () => {
    const label = formatReviewDateLabel('2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
    expect(label).not.toContain('edited');
  });
});
