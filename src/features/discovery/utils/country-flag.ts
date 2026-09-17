export function countryCodeToFlagEmoji(countryCode: string): string {
  const normalized = countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return '';
  }

  return String.fromCodePoint(
    ...normalized.split('').map((character) => 127397 + character.charCodeAt(0)),
  );
}
