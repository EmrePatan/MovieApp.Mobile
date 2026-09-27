const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function buildYoutubeTrailerPlayerHtml(videoId: string): string {
  if (!YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    throw new Error('Invalid YouTube video id.');
  }

  const encodedVideoId = encodeURIComponent(videoId);

  return `<!DOCTYPE html>
<html>
  <head>
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
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          width: '100%',
          height: '100%',
          videoId: '${encodedVideoId}',
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1
          },
          events: {
            onStateChange: function (event) {
              if (event.data === 0 && window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('ended');
              }
            }
          }
        });
      }
    </script>
  </body>
</html>`;
}
