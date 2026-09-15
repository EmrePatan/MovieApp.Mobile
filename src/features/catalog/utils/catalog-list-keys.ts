export function catalogItemKeyExtractor(item: { id: string; type: string }): string {
  return `${item.type}-${item.id}`;
}
