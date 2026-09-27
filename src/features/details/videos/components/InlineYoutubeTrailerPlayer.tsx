import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { buildYoutubeTrailerPlayerHtml } from '../utils/build-youtube-trailer-player-html';
import { getYoutubeEmbedRefererOrigin } from '../utils/youtube-embed-referer';

interface InlineYoutubeTrailerPlayerProps {
  videoId: string;
  onEnded: () => void;
  onPlaybackError?: (errorCode: number) => void;
}

export const InlineYoutubeTrailerPlayer = memo(function InlineYoutubeTrailerPlayer({
  videoId,
  onEnded,
  onPlaybackError,
}: InlineYoutubeTrailerPlayerProps) {
  const embedOrigin = getYoutubeEmbedRefererOrigin();

  const source = useMemo(
    () => ({
      html: buildYoutubeTrailerPlayerHtml(videoId, embedOrigin),
      baseUrl: embedOrigin,
      headers: {
        Referer: embedOrigin,
      },
    }),
    [embedOrigin, videoId],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    if (message === 'ended') {
      onEnded();
      return;
    }

    if (message.startsWith('error:')) {
      const code = Number.parseInt(message.slice('error:'.length), 10);
      if (Number.isFinite(code)) {
        onPlaybackError?.(code);
      }
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
