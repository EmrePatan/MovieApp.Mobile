import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_IDENTITY } from '../../config/app-identity';
import { validateEasBuildProfiles } from '@/config/eas-build-requirements';

describe('production readiness config', () => {
  it('keeps stable app identity identifiers', () => {
    const appConfig = readFileSync(join(process.cwd(), 'app.config.ts'), 'utf8');
    const identityConfig = readFileSync(join(process.cwd(), 'config/app-identity.ts'), 'utf8');

    expect(appConfig).toContain('APP_IDENTITY.iosBundleIdentifier');
    expect(appConfig).toContain('APP_IDENTITY.androidPackage');
    expect(appConfig).toContain('APP_IDENTITY.urlScheme');
    expect(appConfig).toContain(APP_IDENTITY.easProjectId);
    expect(identityConfig).toContain(APP_IDENTITY.androidPackage);
    expect(identityConfig).toContain(APP_IDENTITY.urlScheme);
  });

  it('validates committed eas.json build profiles', () => {
    const eas = JSON.parse(readFileSync(join(process.cwd(), 'eas.json'), 'utf8'));
    expect(validateEasBuildProfiles(eas)).toEqual([]);
  });
});
