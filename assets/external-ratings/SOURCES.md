# External rating provider assets

Bundled for offline display in Movie Cave detail "Other Ratings" cards.

| File | Provider | Origin |
| --- | --- | --- |
| `imdb.svg` | IMDb | Wikimedia Commons [IMDB Logo 2016](https://commons.wikimedia.org/wiki/File:IMDB_Logo_2016.svg) (Amazon/IMDb trademark) |
| `letterboxd-h-pos-rgb.svg` | Letterboxd | Wikimedia Commons [Letterboxd-Logo-H-Pos-RGB](https://commons.wikimedia.org/wiki/File:Letterboxd-Logo-H-Pos-RGB.svg), sourced from [letterboxd.com/about/brand](https://letterboxd.com/about/brand/) |
| `metacritic.svg` | Metacritic | Wikimedia Commons [Metacritic logo](https://commons.wikimedia.org/wiki/File:Metacritic_logo.svg) |
| `tmdb-logo.svg` | TMDB | Wikimedia Commons [Tmdb.new.logo](https://commons.wikimedia.org/wiki/File:Tmdb.new.logo.svg) from [TMDB logos & attribution](https://www.themoviedb.org/about/logos-attribution) |
| `rt-tomatometer.png` | Rotten Tomatoes (Tomatometer) | Rendered from Wikimedia Commons [Rotten Tomatoes.svg](https://commons.wikimedia.org/wiki/File:Rotten_Tomatoes.svg) (fresh tomato mark) |
| `rt-popcorn.png` | Rotten Tomatoes (Popcornmeter) | Rendered from Wikimedia Commons [Rotten Tomatoes positive audience.svg](https://commons.wikimedia.org/wiki/File:Rotten_Tomatoes_positive_audience.svg) (hot popcorn mark) |

Runtime code reads SVG sources via `src/features/external-ratings/config/external-rating-brand-svgs.ts` (generated from the `.svg` files above).
