import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('detail content share wiring', () => {
  it('movie detail content passes share props to DetailHero', () => {
    const source = readFileSync(
      path.join(
        process.cwd(),
        'src/features/details/movie/components/MovieDetailContent.tsx',
      ),
      'utf8',
    );

    expect(source).toContain('share={{');
    expect(source).toContain("contentType: 'movie'");
  });

  it('tv detail content passes share props to DetailHero', () => {
    const source = readFileSync(
      path.join(
        process.cwd(),
        'src/features/details/tv/components/TvShowDetailContent.tsx',
      ),
      'utf8',
    );

    expect(source).toContain('share={{');
    expect(source).toContain("contentType: 'tv'");
  });
});
