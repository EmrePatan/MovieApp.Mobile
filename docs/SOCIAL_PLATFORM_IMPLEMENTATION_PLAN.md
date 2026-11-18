# Social Platform — Mobile Implementation Plan

Status: Approved scope / implementation in progress
Branch: `feature/social-platform`
Base: `master`

## Product decisions
- Mixed home feed: followed users plus discovery-ranked public activities.
- Public-by-default profile, with private-profile support.
- Threaded comments with progressive loading for deep reply chains.
- Likes on activities and comments, follow requests, notifications, blocks and reports.

## Mobile architecture
- Add a dedicated `features/social` module; do not overload existing `features/following`, which follows catalog titles.
- Reuse the existing API client, React Query conventions, auth state, avatar presentation, catalog artwork components, theme and localization infrastructure.
- Add social routes under the app-shell and expose a Social tab only after navigation IA and tab-bar tests are updated intentionally.
- Keep account profile editing separate from public profile presentation. Never display email or linked auth providers on public profiles.
- Feed uses cursor pagination and optimistic like/follow actions with rollback on API failure.
- Threaded comments load roots first and replies on demand; preserve parent context and avoid rendering unbounded nested trees in one pass.
- Group episode activity cards visually while retaining links to the source activities.

## Screens
1. Social feed (Following + Discover lanes or a mixed ranked feed with clear source labels)
2. User search/discovery
3. Public user profile
4. Followers and following lists
5. Threaded activity detail/comments
6. Social notifications
7. Privacy, blocked users and report flows

## Delivery order
1. API types/routes/hooks and tests.
2. Profile/discovery/follow screens.
3. Feed cards and cursor pagination.
4. Activity likes and threaded comments.
5. Notifications, privacy and block/report settings.
6. Accessibility, localization, loading/empty/error states and regression tests.

## Guardrails
- Preserve the four existing primary tabs until navigation design and regression coverage support a deliberate change.
- No Maestro automation. Device testing is manual.
- No merge or deployment from this branch.
