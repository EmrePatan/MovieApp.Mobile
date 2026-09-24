# External rating provider assets

Bundled for offline display in Movie Cave detail "Other Ratings" cards.

| File | Provider | Origin |
| --- | --- | --- |
| `imdb.svg` | IMDb | Wikimedia Commons [IMDB Logo 2016](https://commons.wikimedia.org/wiki/File:IMDB_Logo_2016.svg) (Amazon/IMDb trademark) |
| `letterboxd-h-pos-rgb.svg` | Letterboxd (wordmark) | Wikimedia Commons [Letterboxd-Logo-H-Pos-RGB](https://commons.wikimedia.org/wiki/File:Letterboxd-Logo-H-Pos-RGB.svg), sourced from [letterboxd.com/about/brand](https://letterboxd.com/about/brand/) |
| `letterboxd-icon.png` | Letterboxd (dots icon) | [Letterboxd brand](https://letterboxd.com/about/brand/) social “Dots” decal (dark background), bundled for compact chips |
| `imdb-icon.png` | IMDb (square mark) | Rasterized from Wikimedia Commons [IMDb Logo Square.svg](https://commons.wikimedia.org/wiki/File:IMDb_Logo_Square.svg) |
| `metacritic-mark.svg` / `metacritic-mark.png` | Metacritic (M in circle) | Cropped from bundled `metacritic.svg` (official wordmark’s left mark); aligns with Metacritic mobile “logo without wordmark” usage |
| `metacritic-icon.png` | Metacritic (legacy compact wordmark) | Rasterized from `metacritic.svg` |
| `tmdb-icon.png` | TMDB (compact) | Rasterized from `tmdb-logo.svg` |
| `metacritic.svg` | Metacritic | [Wikipedia FilePath redirect](https://en.wikipedia.org/wiki/Special:FilePath/Metacritic_logo.svg) to Commons [Metacritic logo](https://commons.wikimedia.org/wiki/File:Metacritic_logo.svg) |
| `tmdb-logo.svg` | TMDB | Wikimedia Commons [Tmdb.new.logo](https://commons.wikimedia.org/wiki/File:Tmdb.new.logo.svg) from [TMDB logos & attribution](https://www.themoviedb.org/about/logos-attribution) |
| `rt-tomatometer.png` | Rotten Tomatoes (Tomatometer) | Rendered from Wikimedia Commons [Rotten Tomatoes.svg](https://commons.wikimedia.org/wiki/File:Rotten_Tomatoes.svg) (fresh tomato mark) |
| `rt-popcorn.png` | Rotten Tomatoes (Popcornmeter) | Rendered from Wikimedia Commons [Rotten Tomatoes positive audience.svg](https://commons.wikimedia.org/wiki/File:Rotten_Tomatoes_positive_audience.svg) (hot popcorn mark) |

Runtime UI uses bundled PNGs for React Native. Detail cards use icon marks where available (Letterboxd **Dots**, Metacritic **M**, IMDb square, TMDB icon, RT tomato/popcorn). Re-rasterize after SVG updates with `sharp` (wordmarks: IMDb 320, Letterboxd 280, Metacritic 280, TMDB 120; icons: 128px square where applicable).
