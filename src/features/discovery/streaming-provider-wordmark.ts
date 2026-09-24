import type { TextStyle } from 'react-native';

/** TMDB provider logos are opaque squares — tiles use typographic wordmarks instead. */
export function getStreamingProviderWordmark(providerId: number, name: string): string {
  switch (providerId) {
    case 8:
      return 'NETFLIX';
    case 119:
      return 'prime video';
    case 337:
      return 'Disney+';
    case 350:
      return 'tv+';
    case 1899:
      return 'max';
    case 531:
      return 'Paramount+';
    default:
      return name;
  }
}

export function getStreamingProviderWordmarkStyle(providerId: number): TextStyle {
  switch (providerId) {
    case 8:
      return {
        fontSize: 17,
        fontWeight: '900',
        letterSpacing: 2.8,
        textTransform: 'uppercase',
      };
    case 119:
      return {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.2,
        textTransform: 'lowercase',
      };
    case 337:
      return {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.4,
      };
    default:
      return {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
      };
  }
}
