# MovieApp Mobile

React Native + Expo mobile client for the MovieApp REST API.

This project is intentionally separate from the backend repository at `C:\Users\User\Projects\MovieApp`. The mobile app communicates with the backend only through HTTP/REST. See `docs/MOBILE_API_CONTEXT.md` for the API contract.

## Prerequisites

- Node.js 20+
- npm
- Expo Go or an iOS/Android simulator/emulator
- MovieApp backend running locally on port `5027`

## Install

```bash
npm install
```

## Environment configuration

Copy the example environment file and set the backend URL for your development target:

```bash
copy .env.example .env
```

```env
EXPO_PUBLIC_API_URL=http://localhost:5027
```

Do not commit `.env`. `EXPO_PUBLIC_*` values are bundled into the client and are not secret.

### API URL by development target

| Target | Typical URL |
|--------|-------------|
| iOS simulator | `http://localhost:5027` |
| Android emulator | `http://10.0.2.2:5027` |
| Physical device | `http://<your-computer-lan-ip>:5027` |

Use the actual backend development URL documented in `docs/MOBILE_API_CONTEXT.md`. Do not hardcode URLs in source code.

## Start Expo

```bash
npm start
```

Other scripts:

```bash
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
npm test
```

## Backend connection

```
Mobile App  →  REST API  →  MovieApp Backend
```

- All application data and business rules come from the backend.
- The mobile app does not connect directly to PostgreSQL, Redis, TMDB, or TVDB.
- Authenticated requests send `Authorization: Bearer <accessToken>`.

## Authentication architecture

1. Login/register calls `POST /api/auth/login` or `POST /api/auth/register`.
2. The returned JWT access token is stored with `expo-secure-store`.
3. On startup, the app loads the token from SecureStore and validates it with `GET /api/auth/me`.
4. If the token is invalid (`401`), it is removed and the user is sent to the auth flow.
5. If the backend is temporarily unavailable during startup, the app does not block indefinitely.
6. There is no refresh-token flow; users must sign in again when the token expires.
7. Logout is local only: the token is removed from SecureStore and in-memory auth state.

## Project structure

```text
app/                 Expo Router screens and navigation
src/api/             Central HTTP client and API helpers
src/auth/            Auth provider, SecureStore, auth hooks
src/components/      Reusable UI foundation
src/features/        Feature modules (added in later steps)
src/hooks/           Shared hooks
src/models/          TypeScript API models
src/theme/           Design tokens and shared styles
docs/                API contract reference
```

## Navigation

- `(auth)` — login and register
- `(tabs)` — home, search, watchlist, profile
- Route protection is centralized in `src/hooks/useProtectedRoute.ts`

Future detail screens (movie/TV details, seasons, episodes, settings, etc.) can be added without restructuring the app.

## Security notes

- JWTs are stored only in SecureStore.
- Passwords are never persisted.
- Access tokens and passwords are never logged.
- Do not place secrets in `EXPO_PUBLIC_*` variables.

## Testing

Foundation tests mock network calls and SecureStore. They do not require a running backend.

```bash
npm test
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
```
