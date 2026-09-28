import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  peekReviewsReturnHref,
  returnFromReviewsScreen,
} from '@/features/details/shared/navigation/reviews-detail-navigation';

export function useReviewsExternalReturnBack() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!peekReviewsReturnHref()) {
          return false;
        }

        returnFromReviewsScreen(router);
        return true;
      });

      return () => {
        subscription.remove();
      };
    }, [router]),
  );
}
