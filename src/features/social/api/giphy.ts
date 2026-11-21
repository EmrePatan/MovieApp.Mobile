const GIPHY_SEARCH = 'https://api.giphy.com/v1/gifs/search';
const GIPHY_TRENDING = 'https://api.giphy.com/v1/gifs/trending';

export interface GiphyResult {
  id: string;
  previewUrl: string;
  fullUrl: string;
}

type GiphyPayload = {
  data?: Array<{
    id: string;
    images?: { fixed_width_small?: { url?: string }; downsized_medium?: { url?: string } };
  }>;
};

function mapGiphyPayload(payload: GiphyPayload): GiphyResult[] {
  return (payload.data ?? [])
    .map((item) => {
      const previewUrl = item.images?.fixed_width_small?.url;
      const fullUrl = item.images?.downsized_medium?.url ?? previewUrl;
      if (!previewUrl || !fullUrl) return null;
      return { id: item.id, previewUrl, fullUrl };
    })
    .filter((item): item is GiphyResult => item !== null);
}

function isFetchCanceled(error: unknown, aborted: boolean): boolean {
  if (aborted) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /canceled|aborted|AbortError/i.test(message);
}

async function requestGiphy(url: string, signal?: AbortSignal): Promise<GiphyResult[]> {
  const response = await fetch(url, { signal });
  if (!response.ok) return [];
  const payload = (await response.json()) as GiphyPayload;
  return mapGiphyPayload(payload);
}

export async function fetchTrendingGiphy(apiKey: string, signal?: AbortSignal): Promise<GiphyResult[]> {
  if (!apiKey) return [];
  const url = `${GIPHY_TRENDING}?api_key=${encodeURIComponent(apiKey)}&limit=24&rating=pg-13`;
  return requestGiphy(url, signal);
}

export async function searchGiphy(query: string, apiKey: string, signal?: AbortSignal): Promise<GiphyResult[]> {
  const trimmed = query.trim();
  if (!trimmed || !apiKey) return [];

  const url = `${GIPHY_SEARCH}?api_key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(trimmed)}&limit=24&rating=pg-13`;
  return requestGiphy(url, signal);
}

export { isFetchCanceled };