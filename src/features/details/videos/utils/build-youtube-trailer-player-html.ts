const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/** WebView message: same effect as tapping the hero close control. */
export const TRAILER_PLAYER_CLOSE_MESSAGE = 'close';

export interface YoutubeTrailerPlayerHtmlOptions {
  /** Post `close` when fullscreen or native presentation ends (hero returns to poster + play). */
  closeOnPresentationExit?: boolean;
  enableFullscreenButton?: boolean;
  /** @deprecated Use closeOnPresentationExit */
  listenForPresentationDismiss?: boolean;
  /** @deprecated Use closeOnPresentationExit */
  listenForHtmlFullscreenDismiss?: boolean;
}

export function buildYoutubeTrailerPlayerHtml(
  videoId: string,
  embedOrigin: string,
  options: YoutubeTrailerPlayerHtmlOptions = {},
): string {
  if (!YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    throw new Error('Invalid YouTube video id.');
  }

  const closeOnPresentationExit =
    options.closeOnPresentationExit
    ?? options.listenForPresentationDismiss
    ?? options.listenForHtmlFullscreenDismiss
    ?? false;

  const enableFullscreenButton = options.enableFullscreenButton ?? true;
  const safeOrigin = embedOrigin.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const fsFlag = enableFullscreenButton ? 1 : 0;

  const presentationExitScript = closeOnPresentationExit
    ? `
      var closePostedAt = 0;
      var visibilityWasHidden = false;
      var htmlWasFullscreen = false;
      var documentWasHidden = false;

      function requestCloseLikeHeroButton() {
        var now = Date.now();
        if (now - closePostedAt < 450) {
          return;
        }
        closePostedAt = now;
        postToApp('${TRAILER_PLAYER_CLOSE_MESSAGE}');
      }

      function isDocumentHidden() {
        return !!(document.hidden || document.webkitHidden);
      }

      function isHtmlFullscreen() {
        return !!(
          document.fullscreenElement
          || document.webkitFullscreenElement
          || document.webkitCurrentFullScreenElement
        );
      }

      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden' || isDocumentHidden()) {
          visibilityWasHidden = true;
          return;
        }

        if ((document.visibilityState === 'visible' || !isDocumentHidden()) && visibilityWasHidden) {
          visibilityWasHidden = false;
          requestCloseLikeHeroButton();
        }
      });

      function syncHtmlFullscreenState() {
        var isFs = isHtmlFullscreen();

        if (htmlWasFullscreen && !isFs) {
          requestCloseLikeHeroButton();
        }

        htmlWasFullscreen = isFs;
      }

      document.addEventListener('fullscreenchange', syncHtmlFullscreenState);
      document.addEventListener('webkitfullscreenchange', syncHtmlFullscreenState);

      setInterval(function () {
        syncHtmlFullscreenState();

        var hidden = isDocumentHidden();
        if (documentWasHidden && !hidden) {
          requestCloseLikeHeroButton();
        }
        documentWasHidden = hidden;
      }, 200);
    `
    : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; }
      #player { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script>
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var player;

      function postToApp(message) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(message);
        }
      }

      ${presentationExitScript}

      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          width: '100%',
          height: '100%',
          videoId: '${videoId}',
          host: 'https://www.youtube.com',
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: ${fsFlag},
            origin: '${safeOrigin}'
          },
          events: {
            onStateChange: function (event) {
              if (event.data === 0) {
                postToApp('ended');
              }
            },
            onError: function (event) {
              postToApp('error:' + event.data);
            }
          }
        });
      }
    </script>
  </body>
</html>`;
}
