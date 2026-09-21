import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(__dirname, '../../..');

const followSources = [
  'src/features/follows/components/FollowButton.tsx',
  'src/features/follows/components/FollowPreferencesModal.tsx',
  'src/features/follows/hooks/useTvShowFollowMutations.ts',
];

const forbiddenPatterns = [
  /details\.actions\.followed/,
  /followedEnableNotifications/,
  /setFeedback\(t\(['"]details\.actions\.followed['"]\)\)/,
];

describe('TV show follow success feedback regression guard', () => {
  for (const relativePath of followSources) {
    const source = readFileSync(join(repoRoot, relativePath), 'utf8');

    it(`does not reference removed follow-success copy in ${relativePath}`, () => {
      for (const pattern of forbiddenPatterns) {
        expect(source).not.toMatch(pattern);
      }
    });
  }
});
