---
target: Akış / social feed
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:C:\\Users\\User\\Projects\\MovieApp.Mobile\\app\\(tabs)\\(app-shell)\\social.tsx"
target_fingerprint: "sha256:666632fb1da7a62f15a8c97b5b3da3dc995ead165979fadb3e13f9e83d014562"
target_path: "C:\\Users\\User\\Projects\\MovieApp.Mobile\\app\\(tabs)\\(app-shell)\\social.tsx"
timestamp: 2026-11-19T19-33-54Z
slug: app-tabs-app-shell-social-tsx
---
Method: dual-agent (A: 447c2484-5a50-4a57-8352-29e3eb071cb2 · B: 9ab7ba5e-87dc-4d8e-9a4b-0063106c9897)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Discover/Following live in ListHeaderComponent and scroll away; own-like heart stays visible but dead |
| 2 | Match System / Real World | 1 | Comment kickers claim the review; Discover segment vs Discover catalog tab; social search pill vs Home film search |
| 3 | User Control and Freedom | 2 | Report sheet and retry work; onActivityAuthor dead so comment has no path to review author; review body unclamped |
| 4 | Consistency and Standards | 2 | TabTopChrome shared; feed poster 52×78 vs catalog 72–180; comments clamp 8 lines, reviews do not |
| 5 | Error Prevention | 2 | Own likes blocked but heart still renders; translation nested inside body Pressable that opens thread |
| 6 | Recognition Rather Than Recall | 1 | feedHeadline / feedCommentContext unused; body link has no action name; segment forgotten after scroll |
| 7 | Flexibility and Efficiency | 2 | Like/reply one tap; scan keys (poster, stars, type) are the smallest type on the card |
| 8 | Aesthetic and Minimalist Design | 2 | No stories/composer; gold spent on four-action header, unclamped prose, optional 180px GIF |
| 9 | Error Recovery | 3 | Full-screen, inline, footer retry; mutation failures alert |
| 10 | Help and Documentation | 3 | Signed-out/Following empty clear; Discover empty says “Check back” then Find people |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Generic social timeline, cinema-tinted. Palette (#0A0A0F / #C4A35A) and data cut (reviews + root comments) are Movie Cave. Composition is a standard post: avatar, name, paragraph, link-preview card, heart, bubble, kebab, timestamp. Cinema shows up inside SocialFeedEntry as a 52×78 poster and 12px gold stars — accessory, not driver. TabTopChrome spends gold on people search, follow requests, and bell. SocialFeedCommentMoment and SocialFeedMoment share one skeleton, so a root comment scans as a review. Editorial voice appears only in empty state.

**Deterministic scan:** `impeccable detect --json` on `social.tsx` + `src/features/social/components` → exit 0, `[]` (0 findings). RN StyleSheet coverage is thin; clean scan is a floor, not a sign-off. Theme routes through `@/theme/colors` (no raw #hex in SocialFeed*.tsx).

**Native technical evidence (B):** Unlabeled body link and unlabeled inline retry; Dynamic Type capped by fixed fontSize in SocialFeedEntry; FindPeople minHeight 40; engagement controls lack horizontal hitSlop; duplicate accessibilityLabel on identity + UserAvatar; FlatList defaults untuned for heavy cards. Browser inject skipped (React Native primary).

**Visual overlays:** Not available — native surface; no live inject.

## Overall Impression

The row action set and network chrome are restrained and native. The operate job fails at first glance: you cannot tell comment from review, the film is mid-card at preview scale, and the gold accent opens on people-admin chrome with Discover as default. Biggest opportunity: make the film object and the row type readable in one second, then demote chrome and prose.

## What's Working

1. Short engagement set — heart and bubble only, hairline dividers, liked heart uses accentStrong with the stars (`SocialFeedIconEngagement`).
2. Every surface row still carries poster + title (+ stars when scored); data cut matches the brief (`isSocialFeedSurfaceActivity`, root comments only).
3. Native list chrome — SafeAreaView, TabTopChrome, pull-to-refresh, paging, accent spinner, retry at three depths; segment tabs expose selected state with 44px targets.

## Priority Issues

### [P0] Comment and review are the same picture
- **What:** SocialFeedCommentMoment uses SocialFeedEntry with commenter name and parent activity kicker (“Reviewed a title”). onActivityAuthor is dead; social.feedCommentContext / highlightCommentParentDisplayName unused.
- **Why it matters:** Operate scan question — what kind of row is this — has no answer. Friend-follow social reason is missing.
- **Fix:** Render a distinct comment frame: name the review author, use feedCommentContext, wire onActivityAuthor; do not reuse the review kicker verbatim.
- **Suggested command:** /impeccable clarify (then /impeccable layout)

### [P0] Poster is an accessory
- **What:** 52×78 inside an 8px-padded #14141C card; body is 16/24 and often unclamped; comments allow 8 lines + 180px GIF. Catalog posters are 72–180px.
- **Why it matters:** Product brief says posters primary; the layout teaches the opposite. Cinema diarists will abandon Feed for Profile/Library.
- **Fix:** Lead the card with a larger film object (or still + title card), clamp review body, demote GIF relative to poster.
- **Suggested command:** /impeccable layout

### [P1] Header spends the accent on the wrong job
- **What:** Gold-bordered TabTopChrome with people search, person-add, bell; default segment Discover; same word as catalog tab; Home muscle memory expects film search.
- **Why it matters:** Arrival emotional beat is administrative; secondary surface opens as user acquisition / discovery of people.
- **Fix:** Default Following; consider film search or quieter chrome; let gold sit on poster/stars.
- **Suggested command:** /impeccable quieter (chrome) + /impeccable shape if segment IA changes

### [P1] Scan metadata is the weakest layer; segment scrolls off
- **What:** Time 12px muted under icons (~3.5–3.8:1 on card); stars 12px with no text alternative; tabs leave the viewport with no sticky restoration. Detector-adjacent: body Pressable link has no accessibilityLabel.
- **Why it matters:** Glance readers and low-vision users lose type, time, and corpus; a11y users get a nameless “link” into the thread.
- **Fix:** Raise contrast/size on scan layer; sticky or persistent segment; label body/retry controls; optional sticky chrome for segment.
- **Suggested command:** /impeccable typeset + /impeccable harden (a11y)

### [P1] Six actions, two dishonest
- **What:** Body and bubble both open thread; title card may open catalog or activity; kebab is Report even on own posts; own heart is a non-button; translation nested in body Pressable. FindPeople minHeight 40 (B).
- **Why it matters:** Mis-taps, spoiler risk via translation-in-body, false affordances erode trust on an operate surface.
- **Fix:** One primary open path; hide or explain disabled like; separate translation control; 44pt Find people; hitSlop on engagement.
- **Suggested command:** /impeccable harden + /impeccable clarify

## Persona Red Flags

**Cinema diarist:** Paragraph feed + people search; poster smaller than rest of app → treats Feed as optional.
**Friend follower:** Comment never names review author → social reason to care missing.
**Spoiler-averse / glance reader:** No spoiler field; GIF can dominate; scan layer fails contrast; body link named by essay text.
**Empty Discover newcomer:** “Check back soon” + Find people, no path to a film → acquisition, not cinema.
**Ready to write:** No compose pointer to Profile → feed reads as permanently read-only.

## Minor Observations

- Three type voices across signed-out / empty / populated (wordmark 28, editorial 22, bold 15/16).
- social-ui-tokens.ts still defines SOCIAL_TWITTER_AVATAR / SOCIAL_POSTER_FEED (48×72) while entry hardcodes 40 and 52×78.
- Loading is a lone spinner; first paint does not teach the row.
- SocialFeedTimelineRowView returns null for non-review presentations (dormant path; blank gaps if watch activities leak).
- FlatList lacks tuned initialNumToRender / windowSize; renderItem recreated each render (B, low).

## Questions to Consider

1. A one-second glance can keep one of: whose taste, which film, or what they wrote. Paragraph currently wins. Which is the operate job?
2. If a root comment cannot name the review and reviewer, should it stay on this surface?
3. Profile is the library hub. Open Feed on Following, search films, put gold on poster/stars — accepting divergence from Home chrome?
