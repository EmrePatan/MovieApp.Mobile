# Versioning

MovieApp Mobile uses semantic marketing versions plus platform-specific build numbers.

## Marketing version

Format: `MAJOR.MINOR.PATCH`

Update in:

- `app.config.ts` → `version`
- `package.json` → `version` (keep aligned)

Examples:

- Bug fix release: `1.0.0` → `1.0.1`
- Feature release: `1.0.1` → `1.1.0`
- Breaking release: `1.1.0` → `2.0.0`

## Android versionCode

Update in `app.config.ts` → `android.versionCode`.

Rules:

- Must increase monotonically for every Play Store upload
- Independent from marketing version
- Example: `1` → `2` → `3`

## iOS buildNumber

Update in `app.config.ts` → `ios.buildNumber`.

Rules:

- Must increase monotonically for every App Store upload
- Independent from marketing version
- Can be numeric string, e.g. `"1"`, `"2"`, `"3"`

## Release workflow

1. Decide release type (patch/minor/major)
2. Bump `version` in `app.config.ts` and `package.json`
3. Bump `android.versionCode`
4. Bump `ios.buildNumber`
5. Run quality gate (`npm test`, `npm run lint`, `npm run typecheck`, `npm run config:validate`)
6. Build with EAS production profile
7. Submit through Play Console / App Store Connect

## EAS note

`eas.json` uses `"appVersionSource": "local"`, so version values are read from `app.config.ts` during builds.
