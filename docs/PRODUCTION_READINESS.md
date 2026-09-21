# Mobile production readiness (#30)

Code-side checklist for store builds. Secrets and signing material stay in Expo EAS / store consoles — never in git.

## Repo configuration (validated in CI/local)

Run before release candidates:

```bash
npm run typecheck
npm test -- --runInBand
npm run config:validate
npm run validate:production
```

`validate:production` checks `app.config.ts`, `eas.json`, and `src/config/app-identity.ts` for:

- `com.movieapp.mobile` Android package + iOS bundle identifier
- `movieapp` URL scheme (email verification / password reset deep links)
- `credentialsSource: "remote"` on all EAS profiles (preserves existing remote credentials)
- production profile: `distribution: "store"`, Android `app-bundle`
- `EXPO_PUBLIC_APP_ENV` per profile in `eas.json`

## EAS environment variables (Expo dashboard — manual)

Set per **preview** and **production** environment in [expo.dev](https://expo.dev) (not in the repo):

| Variable | Required | Notes |
|----------|----------|-------|
| `EXPO_PUBLIC_API_URL` | Yes | Public HTTPS API hostname; validated at runtime (no localhost/LAN in production) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Yes | Android Google Sign-In + backend token validation |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Yes | iOS Google Sign-In |
| `EXPO_PUBLIC_IMAGE_BASE_URL` | Recommended | e.g. `https://image.tmdb.org/t/p/w500` for relative poster paths |
| `EXPO_PUBLIC_APP_ENV` | Set in `eas.json` | Do not override per build unless intentional |

`eas.json` intentionally does **not** embed API URLs or OAuth client IDs.

## Signing (manual — do not rotate existing credentials)

| Platform | Action |
|----------|--------|
| Android | Use EAS **remote** credentials (`credentialsSource: "remote"`). Confirm upload key / Play App Signing in Google Play Console. **Do not** delete or regenerate OAuth clients or EAS Android credentials unless rotating intentionally. |
| iOS | Use EAS **remote** credentials. Confirm distribution certificate + provisioning profile for `com.movieapp.mobile` in Apple Developer / EAS. Enable **Sign in with Apple** capability (already declared in `app.config.ts`). |

Local files such as `credentials.json`, `*.jks`, and `*.p8` are gitignored and must not be committed.

## OAuth (manual verification)

| Provider | Repo config | External verification |
|----------|-------------|------------------------|
| Google | `@react-native-google-signin/google-signin` plugin + `iosUrlScheme` in `app.config.ts` | Google Cloud Console: Web + iOS OAuth clients for `com.movieapp.mobile`; SHA-1 for Android release keystore registered on the **existing** Android client |
| Apple | `expo-apple-authentication` + `usesAppleSignIn: true` | Apple Developer: Sign in with Apple enabled for App ID `com.movieapp.mobile`; backend `Authentication:Social:Apple:ClientIds` includes bundle ID |

## Deep links / auth callbacks

| Flow | Scheme / path | Status |
|------|---------------|--------|
| Email verification | `movieapp://verify-email?token=…` | Implemented (`app/(auth)/verify-email.tsx`) |
| Password reset | `movieapp://reset-password?token=…` | Implemented (`app/(auth)/reset-password.tsx`) |
| In-app routes | Expo Router (`/movie/{id}`, `/tv/{id}`, …) | Ready |
| Universal links (https) | — | **Not configured** — requires owned domain + associated domains (future) |

## Push notifications (manual)

| Item | Repo | External |
|------|------|----------|
| Expo push token registration | `expo-notifications` + `push-device-service.ts` | EAS project ID in `APP_IDENTITY` / `app.config.ts` |
| Android FCM | Plugin registered | Upload FCM server key / google-services in EAS credentials if not already present |
| iOS APNs | Plugin registered | APNs key in EAS credentials for `com.movieapp.mobile` |
| Backend delivery | Registers `expoPushToken` via API | Production API must reach Expo push API |

## Store submission (manual)

- Play Console / App Store Connect listings, screenshots, privacy policy URL, data safety / App Privacy questionnaires
- Bump `version`, `android.versionCode`, `ios.buildNumber` per [VERSIONING.md](./VERSIONING.md) before each store upload

## Build commands

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

Ensure EAS production environment variables are set **before** building.
