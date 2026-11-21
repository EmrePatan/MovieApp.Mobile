import type { SocialFeedItem } from '../types';
import type { SocialStoryActor } from '../components/SocialFeedStoriesStrip';

export function deriveSocialStoryActors(
  items: SocialFeedItem[],
  currentUserId?: string,
  limit = 12,
): SocialStoryActor[] {
  const seen = new Set<string>();
  const actors: SocialStoryActor[] = [];

  for (const item of items) {
    if (currentUserId && item.actorId === currentUserId) {
      continue;
    }
    if (seen.has(item.actorId)) {
      continue;
    }
    seen.add(item.actorId);
    actors.push({
      actorId: item.actorId,
      displayName: item.displayName,
      avatarUrl: item.avatarUrl,
    });
    if (actors.length >= limit) {
      break;
    }
  }

  return actors;
}