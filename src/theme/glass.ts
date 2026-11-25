/**
 * Liquid Glass tokens.
 *
 * Glass is reserved for navigation and control layers (tab bar, chips, segments,
 * sheets, floating actions). Poster and content imagery stays flat so the glass
 * can pick up its colour.
 */
export const glass = {
  /** Translucent fill used when a real blur/glass material is behind it. */
  fill: 'rgba(255, 255, 255, 0.07)',
  /** Opaque-ish fill for platforms without a cheap blur (Android). */
  fillSolid: 'rgba(28, 28, 38, 0.86)',
  /** Thin lit edge around the material. */
  border: 'rgba(255, 255, 255, 0.18)',
  /** Specular highlight along the top edge. */
  highlight: 'rgba(255, 255, 255, 0.28)',

  /** Gold-tinted glass for the active/selected state. */
  accentFill: 'rgba(212, 179, 106, 0.22)',
  accentFillSolid: 'rgba(92, 76, 40, 0.92)',
  accentBorder: 'rgba(236, 210, 150, 0.45)',
  accentTint: 'rgba(212, 179, 106, 0.35)',

  /** Panel fills for cards and rows that sit on the plain app background. */
  panel: 'rgba(255, 255, 255, 0.05)',
  panelElevated: 'rgba(255, 255, 255, 0.08)',
  panelInput: 'rgba(255, 255, 255, 0.07)',
  hairline: 'rgba(255, 255, 255, 0.12)',

  blurIntensity: 40,
  /** Android blur is costlier and weaker; keep it off the hot path. */
  blurReductionFactor: 4,
  borderWidth: 1,
} as const;
