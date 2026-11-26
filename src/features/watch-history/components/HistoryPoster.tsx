import { PosterImage } from '@/components/common/PosterImage';

export const HISTORY_POSTER_WIDTH = 44;

export function HistoryPoster({ uri }: { uri: string | null | undefined }) {
  return <PosterImage uri={uri} width={HISTORY_POSTER_WIDTH} height={66} size="w92" />;
}
