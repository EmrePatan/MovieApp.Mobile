import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { buildYoutubeTrailerPlayerHtml } from '../utils/build-youtube-trailer-player-html';

interface InlineYoutubeTrailerPlayerProps {
  videoId: string;
  onEnded: () => void;
}

export const InlineYoutubeTrailerPlayer = memo(function InlineYoutubeTrailerPlayer({
  videoId,
  onEnded,
}: InlineYoutubeTrailerPlayerProps) {
  const source = useMemo(
    () => ({ html: buildYoutubeTrailerPlayerHtml(videoId), baseUrl: 'https://www.youtube.com' }),
    [videoId],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === 'ended') {
      onEnded();
    }
  };

  return (
    <View style={styles.container} testID="inline-trailer-player">
      <WebView
        source={source}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        onMessage={handleMessage}
        originWhitelist={['https://*']}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
    zIndex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
