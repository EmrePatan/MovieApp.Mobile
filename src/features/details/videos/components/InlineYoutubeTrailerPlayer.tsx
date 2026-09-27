import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import {
  TRAILER_PLAYER_CLOSE_MESSAGE,
  buildYoutubeTrailerPlayerHtml,
} from '../utils/build-youtube-trailer-player-html';
import { getYoutubeEmbedRefererOrigin } from '../utils/youtube-embed-referer';

interface InlineYoutubeTrailerPlayerProps {
  videoId: string;
  onClose: () => void;
  onPlaybackError?: (errorCode: number) => void;
}

export const InlineYoutubeTrailerPlayer = memo(function InlineYoutubeTrailerPlayer({
  videoId,
  onClose,
  onPlaybackError,
}: InlineYoutubeTrailerPlayerProps) {
  const embedOrigin = getYoutubeEmbedRefererOrigin();

  const source = useMemo(
    () => ({
      html: buildYoutubeTrailerPlayerHtml(videoId, embedOrigin, {
        enableFullscreenButton: true,
        closeOnPresentationExit: true,
      }),
      baseUrl: embedOrigin,
      headers: {
        Referer: embedOrigin,
      },
    }),
    [embedOrigin, videoId],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const message = event.nativeEvent.data;
      if (message === 'ended' || message === TRAILER_PLAYER_CLOSE_MESSAGE) {
        onClose();
        return;
      }

      if (message.startsWith('error:')) {
        const code = Number.parseInt(message.slice('error:'.length), 10);
        if (Number.isFinite(code)) {
          onPlaybackError?.(code);
        }
      }
    },
    [onClose, onPlaybackError],
  );

  return (
    <View style={styles.container} testID="inline-trailer-player">
      <WebView
        source={source}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
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
    zIndex: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
