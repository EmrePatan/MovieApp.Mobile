import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Dimensions, ScrollView, View } from 'react-native';

interface DetailScrollContextValue {
  scrollToCenter: (targetRef: RefObject<View | null>) => void;
}

const DetailScrollContext = createContext<DetailScrollContextValue | null>(null);

interface DetailScrollProviderProps {
  scrollRef: RefObject<ScrollView | null>;
  children: ReactNode;
}

export function DetailScrollProvider({ scrollRef, children }: DetailScrollProviderProps) {
  const contentRef = useRef<View>(null);

  const scrollToCenter = useCallback(
    (targetRef: RefObject<View | null>) => {
      const target = targetRef.current;
      const content = contentRef.current;

      if (!target || !content || !scrollRef.current) {
        return;
      }

      target.measureLayout(
        content,
        (_x, y, _width, height) => {
          const windowHeight = Dimensions.get('window').height;
          const centeredY = y - (windowHeight - height) / 2 + 56;

          scrollRef.current?.scrollTo({
            y: Math.max(0, centeredY),
            animated: true,
          });
        },
        () => {},
      );
    },
    [scrollRef],
  );

  const value = useMemo(() => ({ scrollToCenter }), [scrollToCenter]);

  return (
    <DetailScrollContext.Provider value={value}>
      <View ref={contentRef} collapsable={false}>
        {children}
      </View>
    </DetailScrollContext.Provider>
  );
}

export function useDetailScroll() {
  return useContext(DetailScrollContext);
}
