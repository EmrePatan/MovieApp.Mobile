# Code Review: Detail Keywords + See All Genres (Mobile)

Review date: 2026-10-01. Review-only.

### Scope Review

**In scope:** 16 modified files—`DetailKeywords`, movie/TV detail integration, `CatalogResultRow` genres, `SearchResultCard`, `catalog.ts`, seven `stage2-*.ts` locale entries, `catalog-result-row` tests.

**Out of scope:** Home carousel (`HomeContentCard`)—no genre changes (correct).

No unrelated tracked or untracked files in mobile git status.

### Mobile Detail

- `DetailKeywords` in `DetailSections.tsx`: reuses `genreChip` / `genreRow` styling (consistent with redesign).
- Placement: after `DetailOverview` on movie and TV.
- Initial cap: 12 chips; `showMoreKeywords` expands (no collapse).
- Empty: `keywords.length === 0` → `null`.
- Chips: `accessibilityRole="text"` (non-interactive); show-more is `button` with label.
- `key={keyword}`: duplicate display strings could theoretically collide; backend distincts names.
- No extra network calls—uses detail payload only.

### Mobile See All

- `CatalogResultRow`: muted caption line, `numberOfLines={1}`, `translateGenreNames`, default `genres = []`.
- Hierarchy: title → type/year → genres → rating (unchanged poster/title priority).
- `SearchResultCard` passes `item.genres` for catalog items only (not persons).
- See All screens using `SearchResultCard` inherit genres (discover-browse, advanced-discover, search, now-in-theaters, on-tv-this-week, world-cinema, streaming platform screen).

### Localization

All seven `stage2-*.ts` files include under `details.sections`:

- `keywords`
- `showMoreKeywords` (with `{{count}}`)

Existing `discovery.advanced.keywords` strings unchanged in meaning; detail section keys added separately (no duplicate key names within the same object).

### Tests

| Check | Result |
|-------|--------|
| `jest --testPathPattern=catalog-result-row` | 7/7 pass |
| `npm run typecheck` | Fail—pre-existing errors in other files (`public-watchlist`, `errors.ts`, `DetailHeaderStack`, etc.); **not introduced by this diff** |
| Detail keyword UI tests | None added |

### Issues Found

| Severity | Issue |
|----------|--------|
| Info | Long localized genre line truncated to 1 line—may ellipsize many genres (max 3 from API mitigates). |
| Info | No automated test for `DetailKeywords` show-more/empty state. |
| Info | `keywords` required on TypeScript detail types—ensure API always returns array (backend contract does). |

### Commit Readiness

**MovieApp.Mobile: READY** — focused diff, no unrelated changes.
