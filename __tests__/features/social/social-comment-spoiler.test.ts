import {
  buildSocialCommentBody,
  parseSocialCommentContent,
} from '@/features/social/utils/social-comment-media';

describe('spoiler flag in comment content', () => {
  it('round-trips the spoiler flag with text', () => {
    const body = buildSocialCommentBody('Katil kardeşmiş', null, true);
    const parsed = parseSocialCommentContent(body);
    expect(parsed.spoiler).toBe(true);
    expect(parsed.text).toBe('Katil kardeşmiş');
  });

  it('keeps media when spoiler is set', () => {
    const body = buildSocialCommentBody('x', { kind: 'gif', value: 'https://media.giphy.com/a.gif' }, true);
    const parsed = parseSocialCommentContent(body);
    expect(parsed.spoiler).toBe(true);
    expect(parsed.gifUrl).toBe('https://media.giphy.com/a.gif');
    expect(parsed.text).toBe('x');
  });

  it('defaults to no spoiler', () => {
    expect(parseSocialCommentContent(buildSocialCommentBody('merhaba', null)).spoiler).toBe(false);
  });
});
