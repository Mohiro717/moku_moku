// ぬばたま落としのホーム画面アプリ（PWA）の見張り役（Service Worker）。
// vite.config.ts の nubatama-pwa が、ビルドのたびに下の CACHE の版と PRECACHE の中身を埋めて dist-nubatama/sw.js に出す。
//
// やっていること
// - 入れたとき: ページ本体・プログラム・アイコンを先にしまう（これだけでタイトルまでは開ける）
// - ページ（index.html）: まずネットに取りに行く。つながらなければ、しまってある版を出す
//   （公開し直したら、次に開いたときに新しい版になる）
// - 画像・音・動画・フォント: しまってあればそれを使い、無ければネットから取ってしまう
//   （一度遊んだところは、つながっていなくても遊べる）
// - 動画と BGM は、ブラウザが「ここからここまで」と切って取りに来る（Range）。
//   しまってあれば切って返し、無ければそのままネットに流して、裏で丸ごと取ってしまっておく
// - 公開し直すと版が変わり、前の版でしまったものは消す
const CACHE = 'nubatama-__VERSION__';
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('nubatama-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (request.mode === 'navigate') {
    event.respondWith(fromNetworkFirst(request));
    return;
  }
  if (request.headers.has('range')) {
    event.respondWith(fromCacheRange(request, event));
    return;
  }
  event.respondWith(fromCacheFirst(request));
});

async function fromNetworkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put('./', response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match('./');
    if (cached) return cached;
    throw err;
  }
}

async function fromCacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // 別のサイト（フォント・Tailwind）は中身が見えない返事（opaque）になるが、しまって使い回せる
  if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
  return response;
}

async function fromCacheRange(request, event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request.url);
  if (!cached) {
    // 裏で丸ごと取ってしまっておく（次からはしまった分を切って返す）
    event.waitUntil(
      fetch(request.url)
        .then((full) => (full.ok ? cache.put(request.url, full) : undefined))
        .catch(() => {}),
    );
    return fetch(request);
  }
  const body = await cached.arrayBuffer();
  const total = body.byteLength;
  const match = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  let start = match && match[1] ? Number(match[1]) : 0;
  let end = match && match[2] ? Number(match[2]) : total - 1;
  if (match && !match[1] && match[2]) {
    // bytes=-500 は「最後の500バイト」
    start = Math.max(0, total - Number(match[2]));
    end = total - 1;
  }
  end = Math.min(end, total - 1);
  if (start >= total || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
  }
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
