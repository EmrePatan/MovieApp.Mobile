---
version: 1
slug: "rofile-components-ownprofiletabheader-tsx-646fab1e"
primary_target: "src/features/profile/components/OwnProfileTabHeader.tsx"
related_targets: ["src/features/library/components/LibraryHubContent.tsx","src/features/library/components/LibraryEmptyState.tsx","app/(tabs)/(app-shell)/library.tsx"]
---

# Profile tab — Program Card Stack

Mode: Operate
Audience: signed-in Movie Cave users scanning their own library
Task: recognize identity, switch shelf category, open titles
Constraints: library hub structure; reviews/comments only elsewhere; palette #0A0A0F / #C4A35A; Expo adaptive

## Direction contract

THESIS: Own Profile is a single inset cinema program card above the shelf — identity and cover share one surface; the grid is the workbench, not a second card stack. Refuses full-bleed social-header sprawl and refuses shelf-first chip anonymity.

OWN-WORLD: Void ground #0A0A0F; program card surface #14141C with hairline gold border; cover still inside the card; avatar gold ring; Playfair/Cormorant identity type; gold tabular meta; category underline as a single transit line.

STORY: Visitor sees “this is my program,” then shelves titles by category without hunting chrome.

FIRST VIEWPORT: Inset program card (cover ~148px inside card, overlapping avatar, serif name, italic handle, settings control, follower/following/movies meta). Below: category underline tabs. Poster grid begins immediately under tabs. Empty: large type + one CTA, no icon disc.

FORM: Program Card Stack (grounded list #5); seed key b5991e8e; locked user choice option 2.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
