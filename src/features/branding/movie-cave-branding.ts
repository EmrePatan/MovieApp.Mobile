/** Native asset dimensions for `assets/images/branding/movie-cave-horizontal-logo.png`. */
export const MOVIE_CAVE_LOGO_ASPECT_RATIO = 724 / 2172;

export function getMovieCaveLogoHeight(width: number): number {
  return Math.round(width * MOVIE_CAVE_LOGO_ASPECT_RATIO);
}
