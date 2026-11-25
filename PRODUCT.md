# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Primary users are people who watch movies and TV series and want a personal “cave” for what they’re watching, have watched, liked, and listed. In the same breath they share reviews and root-level comments with others. Success is feeling ownership of their library and scanning it quickly, with social identity (followers, cover, avatar) as the frame—not a separate activity feed.

## Product Purpose

Movie Cave is a cinema-first social library app: track titles across watching / watched / liked / watchlists, and participate socially through reviews and root comments. The flagship personal surface is the Profile tab, which is the library hub (not an activities timeline).

## Positioning

A dark cinema identity where the library *is* the profile—posters and watch state as the person’s public taste, not a generic social feed of miscellaneous activity rows.

## Operating Context

Expo Router tab shell; Profile primary tab hosts `LibraryHubContent` with an own-profile banner (cover, identity, follower meta). Social profile routes exist for other users. Backend sibling API (`MovieApp`) serves library titles, social profiles, and statistics. Local web is secondary for review; shipped devices are iOS and Android.

## Capabilities and Constraints

- Library categories: watching, watched, liked, watchlist (watchlists overview).
- Social: reviews + root comments only; no cinema band / stories / watch-activity rows as product surface.
- Profile tab label maps to library hub; settings remain under `/(tabs)/profile`.
- Expo SDK 57; follow versioned Expo docs.
- Do not invent commercial claims, fake social proof, or capabilities the API does not expose.

## Brand Commitments

- Product name: **Movie Cave**
- Binding palette: background `#0A0A0F`, accent gold `#C4A35A` (dark cinema)
- Voice: cinematic, precise, not playful social-network slang
- Profile = library hub structure preserved

## Evidence on Hand

- Incumbent UI in `src/features/profile`, `src/features/library`, `src/features/social`
- Theme tokens in `src/theme`
- Figma review board: Movie Cave — Social & Profile Review (prior session)
- No separate marketing site assets required for the Profile operate surface

## Product Principles

1. Library posters are the primary content; chrome stays secondary.
2. Own profile should read as a cinema identity stage, then a browsable shelf—not a settings dump.
3. Social proof is counts and covers from real data only.
4. Premium means restraint and material hierarchy, not more cards or badges.
5. Native affordances (tabs, safe areas, press targets) outrank decorative risk on Operate surfaces.

## Accessibility & Inclusion

Touch targets and contrast must meet typical mobile expectations; support dynamic type via existing `AppText` patterns where already established. No product-specific WCAG certification claimed.
