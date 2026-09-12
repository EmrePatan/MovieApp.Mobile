import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { WatchlistPickerModal } from './WatchlistPickerModal';
import type { WatchlistContentType } from '../types';

interface AddToWatchlistButtonProps {
  contentType: WatchlistContentType;
  contentId: string;
}

export function AddToWatchlistButton({ contentType, contentId }: AddToWatchlistButtonProps) {
  const { requireAuth } = useRequireAuth();
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback('Please sign in to use watchlists.');
      return;
    }

    setVisible(true);
  };

  return (
    <View style={styles.wrapper}>
      <FeedbackMessage message={feedback} tone="info" onDismiss={() => setFeedback(null)} />
      <AppButton
        title="Add to Watchlist"
        variant="secondary"
        onPress={handlePress}
        style={styles.button}
      />
      <WatchlistPickerModal
        visible={visible}
        contentType={contentType}
        contentId={contentId}
        onClose={() => setVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  button: {
    minHeight: 48,
  },
});
