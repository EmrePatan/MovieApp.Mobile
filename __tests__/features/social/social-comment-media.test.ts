import {
  buildSocialCommentBody,
  embedGifInComment,
  embedPosterInComment,
  parseSocialCommentContent,
} from '@/features/social/utils/social-comment-media';

describe('social-comment-media', () => {
  it('parses gif token and text', () => {
    const parsed = parseSocialCommentContent('Harika sahne!\n[gif]https://media.giphy.com/x.gif[/gif]');
    expect(parsed.text).toBe('Harika sahne!');
    expect(parsed.gifUrl).toBe('https://media.giphy.com/x.gif');
    expect(parsed.posterPath).toBeNull();
    expect(parsed.mediaKind).toBe('gif');
  });

  it('parses poster/image token and text', () => {
    const legacy = parseSocialCommentContent('Afis guzel\n[poster]/w500/abc.jpg[/poster]');
    expect(legacy.text).toBe('Afis guzel');
    expect(legacy.posterPath).toBe('/w500/abc.jpg');
    expect(legacy.gifUrl).toBeNull();
    expect(legacy.mediaKind).toBe('image');

    const next = parseSocialCommentContent('Sahne\n[image]/back.jpg[/image]');
    expect(next.posterPath).toBe('/back.jpg');
    expect(next.mediaKind).toBe('image');
  });

  it('embeds gif with optional text', () => {
    expect(embedGifInComment('https://media.giphy.com/x.gif')).toBe('[gif]https://media.giphy.com/x.gif[/gif]');
    expect(embedGifInComment('https://media.giphy.com/x.gif', 'lol')).toBe(
      'lol\n[gif]https://media.giphy.com/x.gif[/gif]',
    );
  });

  it('builds body with exclusive media', () => {
    expect(buildSocialCommentBody('hi', { kind: 'image', value: '/p.jpg' })).toBe(
      'hi\n[image]/p.jpg[/image]',
    );
    expect(buildSocialCommentBody('', { kind: 'gif', value: 'https://media.giphy.com/x.gif' })).toBe(
      '[gif]https://media.giphy.com/x.gif[/gif]',
    );
  });

  it('embedPosterInComment writes image token', () => {
    expect(embedPosterInComment('/x.jpg', 'ok')).toBe('ok\n[image]/x.jpg[/image]');
  });
});

