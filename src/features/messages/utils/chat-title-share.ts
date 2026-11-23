export type ChatShareContentType = 'movie' | 'tv';

export interface ChatTitleShare {
  contentType: ChatShareContentType;
  id: string;
  title: string;
  posterPath: string | null;
  year: string | null;
}

export interface ParsedChatMessage {
  text: string;
  share: ChatTitleShare | null;
}

const SHARE_TOKEN = /\[title\]([^\]]*)\[\/title\]/i;
const FIELD_SEPARATOR = '|';

/**
 * Builds a chat message body that carries a catalog title card.
 * Stored inside the plain text body (like GIF and spoiler tags), so no backend change is needed.
 */
export function buildTitleShareMessage(share: ChatTitleShare, text = ''): string {
  const payload = [
    share.contentType,
    share.id,
    encodeURIComponent(share.title),
    encodeURIComponent(share.posterPath ?? ''),
    encodeURIComponent(share.year ?? ''),
  ].join(FIELD_SEPARATOR);
  const token = `[title]${payload}[/title]`;
  const trimmed = text.trim();
  return trimmed ? `${token}\n${trimmed}` : token;
}

export function parseChatMessage(body: string): ParsedChatMessage {
  const match = body.match(SHARE_TOKEN);
  if (!match) {
    return { text: body, share: null };
  }

  const [contentType, id, title, poster, year] = (match[1] ?? '').split(FIELD_SEPARATOR);
  const text = body.replace(SHARE_TOKEN, '').trim();

  if ((contentType !== 'movie' && contentType !== 'tv') || !id) {
    return { text, share: null };
  }

  try {
    return {
      text,
      share: {
        contentType,
        id,
        title: decodeURIComponent(title ?? ''),
        posterPath: poster ? decodeURIComponent(poster) : null,
        year: year ? decodeURIComponent(year) : null,
      },
    };
  } catch {
    return { text, share: null };
  }
}

/** One-line preview for lists (inbox rows), so the raw tag never leaks. */
export function describeChatMessagePreview(body: string, sharedLabel: string): string {
  const parsed = parseChatMessage(body);
  if (!parsed.share) {
    return parsed.text;
  }
  const label = `🎬 ${parsed.share.title || sharedLabel}`;
  return parsed.text ? `${label} · ${parsed.text}` : label;
}
