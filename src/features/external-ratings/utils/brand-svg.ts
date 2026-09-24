export function resolveRenderableBrandSvg(xml: string | undefined | null): string | null {
  if (!xml) {
    return null;
  }

  const trimmed = xml.trim();
  if (!trimmed || trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html')) {
    return null;
  }

  const svgStart = trimmed.indexOf('<svg');
  if (svgStart === -1) {
    return null;
  }

  return trimmed.slice(svgStart);
}
