import type { ReactNode } from 'react';
import { borderRadius } from '@/theme/spacing';
import { DetailDirectionalFrame } from './DetailDirectionalFrame';

interface DetailHeroPosterFrameProps {
  children: ReactNode;
}

export function DetailHeroPosterFrame({ children }: DetailHeroPosterFrameProps) {
  return (
    <DetailDirectionalFrame variant="gold" borderRadius={borderRadius.md}>
      {children}
    </DetailDirectionalFrame>
  );
}
