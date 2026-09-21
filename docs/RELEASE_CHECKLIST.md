# Release checklist

Use this document before creating production builds or submitting to Google Play / the App Store.

## Versioning

See [VERSIONING.md](./VERSIONING.md) for how to bump:

- marketing version (`1.0.0`)
- Android `versionCode`
- iOS `buildNumber`

Current baseline:

| Field | Location | Current value |
|-------|----------|---------------|
| Marketing version | `app.config.ts` → `version` | `1.0.0` |
| Android versionCode | `app.config.ts` → `android.versionCode` | `1` |
| iOS buildNumber | `app.config.ts` → `ios.buildNumber` | `4` (TestFlight Build 4) |

**Next Final RC:** bump `ios.buildNumber` to **`5`** immediately before the production EAS iOS build (do not reuse Build 4).

---

## Environment

| Item | Status | Notes |
|------|--------|-------|
| `EXPO_PUBLIC_API_URL` configured per profile | Required | Set in EAS env for preview/production |
| Production URL uses HTTPS | Required | Enforced at runtime for production builds |
| Production URL is not localhost/LAN | Required | Enforced at runtime for production builds |
| `EXPO_PUBLIC_APP_ENV` set per EAS profile | Ready | `development`, `preview`, `production` in `eas.json` |
| `.env` ignored by git | Ready | See `.gitignore` |
| No secrets in `EXPO_PUBLIC_*` vars | Ready | Client-exposed vars only |

Production API URL is **not configured in-repo**. Set it in EAS project environment variables before a production build.

---

## App identity

| Item | Value |
|------|-------|
| App name | Movie Cave |
| Slug | movieapp-mobile |
| URL scheme | `movieapp` |
| Android package | `com.movieapp.mobile` |
| iOS bundle identifier | `com.movieapp.mobile` |

These are development-safe placeholders. Confirm final commercial identifiers before store submission.

---

## Assets

| Asset | File | Status |
|-------|------|--------|
| App icon | `assets/icon.png` | Present |
| Android adaptive foreground | `assets/branding/adaptive-icon-foreground.png` | Present |
| Android adaptive background | `assets/android-icon-background.png` | Present |
| Android monochrome icon | `assets/branding/monochrome-icon.png` | Present |
| Splash image | `assets/splash-icon.png` | Present |
| Web favicon | `assets/favicon.png` | Present |
| Store screenshots | — | **TODO** — create before submission |
| Feature graphic (Play) | — | **TODO** |
| App Store preview assets | — | **TODO** |

Splash is configured in `app.config.ts` with dark background `#0A0A0F`.

---

## Permissions

The app currently requests **no optional native permissions** beyond what Expo Router / SecureStore require.

| Permission | Required? | Status |
|------------|-----------|--------|
| Camera | No | Not requested |
| Microphone | No | Not requested |
| Location | No | Not requested |
| Contacts | No | Not requested |
| Notifications | Yes (push) | `expo-notifications`; user permission requested on follow flows |
| Photos/media | No | Not requested |
| Storage | No | Not requested |

Re-audit after adding features that need native capabilities.

---

## Security & account management

| Item | Status |
|------|--------|
| JWT stored in SecureStore | Ready |
| Passwords not persisted | Ready |
| No console logging of tokens/passwords | Ready |
| Central 401 handling | Ready |
| Logout clears user query cache | Ready |
| Account deletion clears cache + logs out | Ready |
| Production API URL validation | Ready |

---

## Deep linking foundation

| Route | App path | Status |
|-------|----------|--------|
| Movie detail | `/movie/{id}` | Ready (Expo Router) |
| TV detail | `/tv/{id}` | Ready |
| Season | `/tv/{id}/season/{seasonNumber}` | Ready |
| Episode | `/tv/{id}/season/{seasonNumber}/episode/{episodeNumber}` | Ready |
| Custom scheme | `movieapp://` | Ready |

Universal links / associated domains are **not configured** (requires owned domain — future step).

---

## Android (Google Play)

| Item | Status |
|------|--------|
| Package name finalized | Placeholder ready |
| Version / versionCode | Ready in `app.config.ts` |
| App icon | Present |
| Adaptive icon | Present |
| Splash screen | Configured |
| Permissions audit | Complete |
| AAB production build profile | Ready in `eas.json` |
| Play App Signing | **TODO** — configure in Play Console |
| Upload keystore / EAS credentials | **Remote** — `credentialsSource: "remote"` in `eas.json`; verify in EAS dashboard |
| Store listing (title, description) | **TODO** |
| Screenshots | **TODO** |
| Privacy policy URL | **TODO in Play Console** — live site: `https://moviecaveapp.com/privacy/` |
| Data safety form | **TODO** |
| Content rating questionnaire | **TODO** |
| Support email/URL | **TODO in Play Console** — `support@moviecaveapp.com` |
| Account deletion compliance | Client flow ready; document in store listing |

### Suggested production build command

```bash
eas build --platform android --profile production
```

Set `EXPO_PUBLIC_API_URL` (HTTPS) in EAS production environment variables first.

---

## iOS (App Store)

| Item | Status |
|------|--------|
| Bundle identifier finalized | Placeholder ready |
| Version / build number | Ready in `app.config.ts` |
| App icon | Present |
| Splash / launch screen | Configured |
| Permissions audit | Complete |
| Production build profile | Ready in `eas.json` |
| Apple Developer account | Operator-owned (verify active membership) |
| App Store Connect app record | `ascAppId` `6814454427` in `eas.json` submit profile |
| Distribution certificate / provisioning | **Remote** — `credentialsSource: "remote"` in `eas.json`; verify Sign in with Apple capability |
| Store listing | **TODO** |
| Screenshots | **TODO** |
| App Privacy details | **TODO in App Store Connect** |
| Support URL | **TODO in App Store Connect** — `https://moviecaveapp.com/` / `support@moviecaveapp.com` |
| Terms of service URL | Live site: `https://moviecaveapp.com/terms/` |
| Account deletion URL | Live site: `https://moviecaveapp.com/delete-account/` |
| Account deletion behavior documented | Client flow ready |

### Suggested production build command

```bash
eas build --platform ios --profile production
```

Set `EXPO_PUBLIC_API_URL` (HTTPS) in EAS production environment variables first.

---

## Pre-release quality gate

Run locally before every release candidate:

```bash
npm test -- --runInBand
npm run lint
npm run typecheck
npm run config:validate
npm run validate:production
```

See [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) for EAS dashboard and store-console manual steps.

---

## External information still required

Before store submission, prepare:

1. **Privacy policy URL** — required by both stores
2. **Support/contact URL or email**
3. **Production HTTPS API URL** — set in EAS, not committed
4. **Final app identifiers** — if changing from `com.movieapp.mobile`
5. **Store screenshots and descriptions**
6. **Data collection declarations** — auth, favorites, ratings, watch history, reviews, profile data
7. **Third-party services disclosure** — backend API, optional image CDN base URL
8. **Signing credentials** — via EAS/Play Console/App Store Connect

Do not invent URLs or legal text in the repository.
