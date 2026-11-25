import {
  buildSocialLinkUrl,
  filledSocialLinks,
  normalizeSocialHandle,
  serializeSocialLinksForUpdate,
  socialLinksToDraft,
} from '@/features/profile/utils/profile-social-links';

describe('profile-social-links', () => {
  it('normalizes handles and strips @ / profile URLs', () => {
    expect(normalizeSocialHandle('instagram', '@emre')).toBe('emre');
    expect(normalizeSocialHandle('x', 'https://x.com/emre')).toBe('emre');
    expect(normalizeSocialHandle('x', 'https://twitter.com/emre')).toBe('emre');
    expect(normalizeSocialHandle('instagram', '   ')).toBeNull();
  });

  it('normalizes website URLs', () => {
    expect(normalizeSocialHandle('website', 'example.com')).toBe('https://example.com/');
    expect(normalizeSocialHandle('website', 'https://example.com/path')).toBe(
      'https://example.com/path',
    );
    expect(normalizeSocialHandle('website', 'not a url :::')).toBeNull();
  });

  it('builds openable URLs', () => {
    expect(buildSocialLinkUrl('tiktok', 'emre')).toBe('https://www.tiktok.com/@emre');
    expect(buildSocialLinkUrl('website', 'https://cave.app')).toBe('https://cave.app/');
  });

  it('returns only filled links in platform order', () => {
    const filled = filledSocialLinks({
      youtube: null,
      instagram: '@a',
      x: 'b',
      website: 'https://c.dev',
    });
    expect(filled.map((item) => item.platform)).toEqual(['x', 'instagram', 'website']);
  });

  it('serializes draft to update payload and back to draft', () => {
    const draft = socialLinksToDraft({ instagram: 'emre', website: 'https://cave.app' });
    expect(draft.instagram).toBe('@emre');
    expect(draft.x).toBe('');

    const payload = serializeSocialLinksForUpdate({
      ...draft,
      x: '@hello',
      snapchat: '',
    });
    expect(payload.instagram).toBe('emre');
    expect(payload.x).toBe('hello');
    expect(payload.snapchat).toBeNull();
  });
});
