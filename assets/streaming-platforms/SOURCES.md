# Streaming platform tile wordmarks

Bundled **transparent PNG** wordmarks for popular watch-provider tiles (Discover hub, detail “Yayın Platformları”). TMDB provider logos are opaque squares; these assets keep logos readable on poster/brand backdrops.

| PNG | TMDB `providerId` | Source SVG (`source/`) | Wikimedia Commons |
| --- | --- | --- | --- |
| `netflix.png` | 8 | `netflix.svg` | [Netflix 2015 logo.svg](https://commons.wikimedia.org/wiki/File:Netflix_2015_logo.svg) |
| `prime-video.png` | 119 | `prime-video.svg` | [Amazon Prime Video logo (2022).svg](https://commons.wikimedia.org/wiki/File:Amazon_Prime_Video_logo_(2022).svg) |
| `disney-plus.png` | 337 | `disney-plus.svg` | [Disney Plus logo.svg](https://commons.wikimedia.org/wiki/File:Disney_Plus_logo.svg) |
| `apple-tv-plus.png` | 350 | `apple-tv-plus.svg` | [Apple TV Plus Logo.svg](https://commons.wikimedia.org/wiki/File:Apple_TV_Plus_Logo.svg) (fill set to white for dark tiles) |
| `max.png` | 1899 | `max.svg` | [Max logo.svg](https://commons.wikimedia.org/wiki/File:Max_logo.svg) |
| `paramount-plus.png` | 531 | `paramount-plus.svg` | [Paramount+ logo.svg](https://commons.wikimedia.org/wiki/File:Paramount%2B_logo.svg) |
| `crunchyroll.png` | 283 | `crunchyroll.svg` | [Crunchyroll Logo.svg](https://commons.wikimedia.org/wiki/File:Crunchyroll_Logo.svg) |

Authoritative vectors live in `source/`. Re-rasterize after edits:

```bash
cd MovieApp.Mobile
node scripts/rasterize-streaming-platform-wordmarks.mjs
```

Trademarks belong to their respective owners; used for catalog navigation only.
